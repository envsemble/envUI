import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { ContextMenu } from './Menu.js';

export interface TreeItem {
  /** Stable, unique identifier; rows carry it as data-id. */
  id: string;
  /** Nesting level of the visible row, starting at 0. */
  depth: number;
  /** The row has children and shows a chevron. */
  expandable?: boolean;
  expanded?: boolean;
  label: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Muted text after the label, such as a status or a path. */
  detail?: ReactNode;
  /** End content, such as a Counter or Badge. */
  trailing?: ReactNode;
  /** Native tooltip of the row, such as the full path. */
  title?: string;
  /** Text for type-ahead when the label is not a plain string. */
  textValue?: string;
  disabled?: boolean;
}

export interface TreeOpenOptions {
  /** Single click and Space preview an item; double click and Enter open it. */
  preview: boolean;
}

export interface TreeProps<T extends TreeItem> {
  /** The visible rows in order, flattened; the application owns expansion. */
  items: readonly T[];
  /** Accessible name of the tree. */
  'aria-label': string;
  /** The selected row; it scrolls into view when it changes. */
  selectedId?: string | null;
  /** Click and Space call it with preview true; double click and Enter with preview false. */
  onOpen: (item: T, options: TreeOpenOptions) => void;
  /** Chevron clicks, ArrowRight on a collapsed row and ArrowLeft on an expanded row. */
  onExpandedChange: (item: T, expanded: boolean) => void;
  /** Menu items for a row, or for the tree's empty area when the item is null. */
  contextMenu?: (item: T | null) => ReactNode;
  /** Accessible name of the context menu. */
  contextMenuLabel?: string;
  /** compact (default) rows are about 1.75 rem tall; standard rows about 2.25 rem. */
  density?: 'compact' | 'standard';
  className?: string;
}

/** Rows outside the viewport kept rendered above and below it. */
const overscan = 8;
const typeAheadDelay = 600;
const rowRem = { compact: 1.75, standard: 2.25 };

/** A row id safe for id references, whatever characters the item id contains. */
function rowElementId(treeId: string, itemId: string) {
  return `${treeId}-row-${itemId.replace(
    /[^A-Za-z0-9_-]/g,
    (character) => `_${character.codePointAt(0)!.toString(16)}_`,
  )}`;
}

function itemText(item: TreeItem) {
  return item.textValue ?? (typeof item.label === 'string' ? item.label : '');
}

/** Position and size of each row among its siblings, for aria-posinset and aria-setsize. */
function siblingPositions(items: readonly TreeItem[]) {
  const positions = new Array<number>(items.length);
  const sizes = new Array<number>(items.length);
  // Each open level keeps the indexes of its rows until a shallower row closes it.
  const levels: number[][] = [];
  const close = (depth: number) => {
    while (levels.length > depth) {
      const rows = levels.pop()!;
      for (const index of rows) sizes[index] = rows.length;
    }
  };
  items.forEach((item, index) => {
    close(item.depth + 1);
    while (levels.length < item.depth + 1) levels.push([]);
    const rows = levels[item.depth]!;
    rows.push(index);
    positions[index] = rows.length;
  });
  close(0);
  return { positions, sizes };
}

/**
 * A virtualized tree of rows for large hierarchies such as file trees. The application passes the
 * visible rows and owns expansion; the tree owns focus, keyboard navigation and scrolling.
 */
export function Tree<T extends TreeItem>({
  items,
  'aria-label': label,
  selectedId = null,
  onOpen,
  onExpandedChange,
  contextMenu,
  contextMenuLabel = 'Actions',
  density = 'compact',
  className,
}: TreeProps<T>) {
  const treeId = useId().replace(/[^A-Za-z0-9_-]/g, '');
  const container = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(rowRem[density] * 16);
  const [activeId, setActiveId] = useState<string | null>(selectedId);
  // Keyboard focus shows a ring on the active row; pointer focus does not.
  const [focusVisible, setFocusVisible] = useState(false);
  const pointerFocus = useRef(false);
  const typeAhead = useRef({ text: '', time: 0 });
  // The last selection scrolled into view; a new selection is revealed once its row is visible.
  const revealedSelection = useRef<string | null>(null);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item, index) => map.set(item.id, index));
    return map;
  }, [items]);
  const { positions, sizes } = useMemo(() => siblingPositions(items), [items]);

  // The active row falls back to the selected or first row when it leaves the visible rows.
  const lastActiveIndex = useRef(0);
  let activeIndex = activeId === null ? -1 : (indexById.get(activeId) ?? -1);
  if (activeIndex === -1 && items.length > 0) {
    const selectedIndex = selectedId === null ? -1 : (indexById.get(selectedId) ?? -1);
    activeIndex =
      selectedIndex !== -1 ? selectedIndex : Math.min(lastActiveIndex.current, items.length - 1);
  }
  lastActiveIndex.current = Math.max(activeIndex, 0);
  const activeItem = activeIndex === -1 ? undefined : items[activeIndex];

  // Row height follows the density, enlarged text and coarse pointers; it is read from a row.
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => {
      setViewportHeight(element.clientHeight);
      const row = element.querySelector<HTMLElement>('.env-tree-row');
      const height = row?.getBoundingClientRect().height;
      if (height) setRowHeight(height);
      else {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        setRowHeight(rowRem[density] * rem);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [density, items.length > 0]);

  const scrollToIndex = useCallback(
    (index: number, block: 'nearest' | 'center' = 'nearest') => {
      const element = container.current;
      if (!element || index < 0) return;
      const top = index * rowHeight;
      const bottom = top + rowHeight;
      const height = element.clientHeight;
      if (block === 'center' && (top < element.scrollTop || bottom > element.scrollTop + height)) {
        element.scrollTop = Math.max(0, top - (height - rowHeight) / 2);
      } else if (top < element.scrollTop) element.scrollTop = top;
      else if (bottom > element.scrollTop + height) element.scrollTop = bottom - height;
      setScrollTop(element.scrollTop);
    },
    [rowHeight],
  );

  useEffect(() => {
    if (selectedId !== null) setActiveId(selectedId);
  }, [selectedId]);

  // Revealing waits until the row is among the items and the tree has a size, for example while a
  // collapsed sidebar hides it.
  useLayoutEffect(() => {
    if (selectedId === null || selectedId === revealedSelection.current || viewportHeight === 0)
      return;
    const index = indexById.get(selectedId);
    if (index === undefined) return;
    revealedSelection.current = selectedId;
    scrollToIndex(index, 'center');
  }, [selectedId, indexById, scrollToIndex, viewportHeight]);

  function activate(index: number) {
    const item = items[Math.max(0, Math.min(items.length - 1, index))];
    if (!item) return;
    setActiveId(item.id);
    scrollToIndex(indexById.get(item.id)!);
  }

  function open(item: T, preview: boolean) {
    if (!item.disabled) onOpen(item, { preview });
  }

  function setExpanded(item: T, expanded: boolean) {
    if (!item.disabled) onExpandedChange(item, expanded);
  }

  function findByText(key: string) {
    const now = performance.now();
    const state = typeAhead.current;
    state.text = now - state.time > typeAheadDelay ? key : state.text + key;
    state.time = now;
    const query = state.text.toLocaleLowerCase();
    // A repeated first letter cycles through matches; longer text refines the current match.
    const repeated = query.length > 1 && [...query].every((character) => character === query[0]);
    const search = repeated ? query[0]! : query;
    const start = repeated || query.length === 1 ? activeIndex + 1 : activeIndex;
    for (let offset = 0; offset < items.length; offset += 1) {
      const index = (start + offset) % items.length;
      if (itemText(items[index]!).toLocaleLowerCase().startsWith(search)) return index;
    }
    return -1;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || !activeItem) return;
    const page = Math.max(1, Math.floor(viewportHeight / rowHeight) - 1);
    let handled = true;
    switch (event.key) {
      case 'ArrowDown':
        activate(activeIndex + 1);
        break;
      case 'ArrowUp':
        activate(activeIndex - 1);
        break;
      case 'Home':
        activate(0);
        break;
      case 'End':
        activate(items.length - 1);
        break;
      case 'PageDown':
        activate(activeIndex + page);
        break;
      case 'PageUp':
        activate(activeIndex - page);
        break;
      case 'ArrowRight':
      case 'ArrowLeft': {
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const inward = (event.key === 'ArrowRight') !== rtl;
        if (inward) {
          if (activeItem.expandable && !activeItem.expanded) setExpanded(activeItem, true);
          else if (activeItem.expanded && items[activeIndex + 1]?.depth === activeItem.depth + 1)
            activate(activeIndex + 1);
        } else if (activeItem.expandable && activeItem.expanded) {
          setExpanded(activeItem, false);
        } else {
          for (let index = activeIndex - 1; index >= 0; index -= 1) {
            if (items[index]!.depth < activeItem.depth) {
              activate(index);
              break;
            }
          }
        }
        break;
      }
      case 'Enter':
        open(activeItem, false);
        break;
      case ' ': {
        // While typing ahead, a space belongs to the typed text.
        const typing = performance.now() - typeAhead.current.time <= typeAheadDelay;
        if (typing && typeAhead.current.text) {
          const index = findByText(event.key);
          if (index !== -1) activate(index);
        } else open(activeItem, true);
        break;
      }
      default:
        handled = false;
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const index = findByText(event.key);
          if (index !== -1) activate(index);
          handled = true;
        }
    }
    if (handled) {
      event.preventDefault();
      setFocusVisible(true);
    }
  }

  function rowFromEvent(event: MouseEvent<HTMLElement>) {
    const row = (event.target as Element).closest<HTMLElement>('.env-tree-row');
    const index = row?.dataset.id === undefined ? undefined : indexById.get(row.dataset.id);
    return index === undefined ? undefined : items[index];
  }

  function onRowClick(event: MouseEvent<HTMLElement>) {
    const item = rowFromEvent(event);
    if (!item) return;
    setActiveId(item.id);
    if ((event.target as Element).closest('.env-tree-chevron') && item.expandable) {
      setExpanded(item, !item.expanded);
      return;
    }
    open(item, true);
  }

  function onRowDoubleClick(event: MouseEvent<HTMLElement>) {
    const item = rowFromEvent(event);
    if (!item || (event.target as Element).closest('.env-tree-chevron')) return;
    open(item, false);
  }

  // Only rows in view, plus overscan and the active row, are in the document.
  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const last = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan,
  );
  const indexes: number[] = [];
  for (let index = first; index <= last; index += 1) indexes.push(index);
  if (activeIndex !== -1 && (activeIndex < first || activeIndex > last)) indexes.push(activeIndex);

  const tree = (
    <div
      ref={container}
      role="tree"
      aria-label={label}
      aria-activedescendant={activeItem ? rowElementId(treeId, activeItem.id) : undefined}
      tabIndex={0}
      className={classNames('env-tree', className)}
      data-density={density}
      data-focus-visible={focusVisible ? '' : undefined}
      onKeyDown={onKeyDown}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      onPointerDown={() => {
        pointerFocus.current = true;
        setFocusVisible(false);
      }}
      onFocus={(event) => {
        if (event.target === event.currentTarget) setFocusVisible(!pointerFocus.current);
        pointerFocus.current = false;
      }}
      onClick={onRowClick}
      onDoubleClick={onRowDoubleClick}
      onContextMenu={(event) => {
        const item = rowFromEvent(event);
        if (item) setActiveId(item.id);
      }}
    >
      <div className="env-tree-rows" style={{ blockSize: items.length * rowHeight }}>
        {indexes.map((index) => {
          const item = items[index]!;
          return (
            <div
              key={item.id}
              id={rowElementId(treeId, item.id)}
              role="treeitem"
              aria-level={item.depth + 1}
              aria-posinset={positions[index]}
              aria-setsize={sizes[index]}
              aria-expanded={item.expandable ? Boolean(item.expanded) : undefined}
              aria-selected={item.id === selectedId}
              aria-disabled={item.disabled || undefined}
              title={item.title}
              className="env-tree-row"
              data-id={item.id}
              data-active={index === activeIndex ? '' : undefined}
              style={
                {
                  '--env-tree-depth': item.depth,
                  transform: `translateY(${index * rowHeight}px)`,
                } as CSSProperties
              }
            >
              <span
                className="env-tree-chevron"
                aria-hidden="true"
                data-expanded={item.expanded ? '' : undefined}
              >
                {item.expandable && (
                  <span className="env-symbol">
                    <ChevronRight />
                  </span>
                )}
              </span>
              {item.icon != null && (
                <span className="env-symbol env-tree-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="env-tree-label">{item.label}</span>
              {item.detail != null && (
                <>
                  {' '}
                  <span className="env-tree-detail">{item.detail}</span>
                </>
              )}
              {item.trailing != null && <span className="env-tree-trailing">{item.trailing}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!contextMenu) return tree;
  return (
    <ContextMenu
      aria-label={contextMenuLabel}
      content={(target) => {
        const id = target?.closest<HTMLElement>('.env-tree-row')?.dataset.id;
        const index = id === undefined ? undefined : indexById.get(id);
        return contextMenu(index === undefined ? null : items[index]!);
      }}
    >
      {tree}
    </ContextMenu>
  );
}
