'use client';

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
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { tree as treeMessages } from '../foundations/messages/tree.js';
import type { RowDensity } from '../foundations/Theme.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { ContextMenu } from './ContextMenu.js';
import { remPixels } from '../internal/lengths.js';
import { isRightToLeft } from '../internal/direction.js';
import '../styles/Base.css';
import '../styles/Tree.css';

export interface TreeItem {
  /** Stable, unique identifier; rows carry it as data-id. */
  id: string;
  /** The row's nesting level, 0 for a top-level row; each level indents it by 0.75 rem. */
  depth: number;
  /**
   * The row has children: it shows a chevron, which expands and collapses it, as do the arrow
   * keys.
   */
  expandable?: boolean;
  /** The row's children show, as the rows that follow it in items; its chevron points down. */
  expanded?: boolean;
  /**
   * The row's text, which names it and ends with an ellipsis where the row is too narrow;
   * type-ahead matches it where it is a string.
   */
  label: ReactNode;
  /** A decorative icon before the label, such as a folder or a document, at the control icon size. */
  icon?: ReactNode;
  /**
   * Muted text after the label, such as a status or a path. It gives way first where the row runs
   * out of room, and is read with the label.
   */
  description?: ReactNode;
  /** Content at the end of the row, such as a Badge with a count; it is read with the label. */
  end?: ReactNode;
  /** The row's native tooltip, such as the full path of a truncated name. */
  title?: string;
  /** The text type-ahead matches, where the label is not a plain string. */
  textValue?: string;
  /**
   * The row is dimmed and reports aria-disabled: the keyboard still reaches it, but it neither
   * opens nor expands.
   */
  disabled?: boolean;
}

export interface TreeActionOptions {
  /**
   * True for a single click and Space, which preview the item, such as in a preview tab; false for
   * a double click and Enter, which open it to keep.
   */
  preview: boolean;
}

export interface TreeProps<T extends TreeItem> {
  /**
   * The visible rows in order, flattened: an expanded row is followed by its visible descendants.
   * The application owns expansion; collapsing a row removes its descendants from items.
   */
  items: readonly T[];
  /** The tree's accessible name, such as Files. */
  'aria-label': string;
  /**
   * The selected row's id: it takes the navigation selection colors and scrolls into view when it
   * changes. The application sets it, usually from onAction.
   */
  value?: string | null;
  /**
   * Called when people open a row: with preview true on a single click and Space, and false on a
   * double click and Enter. Expandable rows call it too, and disabled rows don't.
   */
  onAction: (item: T, options: TreeActionOptions) => void;
  /**
   * Called with the row and its new state from a press on its chevron, the right arrow key on a
   * collapsed row and the left arrow key on an expanded one, mirrored in right-to-left text. The
   * application updates items.
   */
  onExpandedChange: (item: T, expanded: boolean) => void;
  /**
   * Menu items for the row people right-click, or press Shift+F10 or the Menu key on, or for the
   * tree's empty area when the item is null. Without it, the browser's own context menu stays.
   */
  contextMenu?: (item: T | null) => ReactNode;
  /**
   * The context menu's accessible name.
   * @default 'Actions', or EnvUIProvider's messages.tree.actions
   */
  contextMenuLabel?: string;
  /**
   * How tightly the rows pack: xs, sm, md or lg changes only their block padding, never the text
   * or the icons. In the comfortable scale sm rows are 1.75 rem tall and md rows 2.25 rem. Under a
   * coarse pointer every row is at least 2.75 rem.
   * @default 'sm'
   */
  density?: RowDensity;
  /** A class for the tree, the element that scrolls. */
  className?: string;
  /** The tree's inline style, such as a height. */
  style?: CSSProperties;
  /** The tree element, which scrolls and holds focus. */
  ref?: Ref<HTMLDivElement>;
}

/** Rows outside the viewport kept rendered above and below it. */
const overscan = 8;
/**
 * The rows a tree renders before it has measured its viewport, such as in the server's markup: as
 * many as a tall pane shows, so the first paint is already full and measuring only adds rows.
 */
const unmeasuredRows = 24;
/** How long typed letters keep adding up for typeahead, in milliseconds. */
const typeaheadTimeout = 600;
/** Each density's row height in rem in the comfortable scale, until a row can be measured. */
const rowRem: Record<RowDensity, number> = { xs: 1.5, sm: 1.75, md: 2.25, lg: 2.75 };

/** A row id safe for id references, whatever characters the item id contains. */
function rowElementId(treeId: string, itemId: string) {
  return `${treeId}-row-${itemId.replace(
    /[^A-Za-z0-9-]/g,
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
 * visible rows and owns expansion and selection; the tree owns focus, keyboard navigation and
 * scrolling. It fills its parent's height, scrolls itself and renders only the rows in view.
 */
export function Tree<T extends TreeItem>({
  items,
  'aria-label': label,
  value: selectedId = null,
  onAction,
  onExpandedChange,
  contextMenu,
  contextMenuLabel,
  density = 'sm',
  className,
  style,
  ref,
}: TreeProps<T>) {
  const messages = useMessages('tree', treeMessages);
  const treeId = useId().replace(/[^A-Za-z0-9-]/g, '');
  const container = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(rowRem[density] * 16);
  const [activeId, setActiveId] = useState<string | null>(selectedId);
  // Keyboard focus shows a ring on the active row; pointer focus does not.
  const [focusVisible, setFocusVisible] = useState(false);
  const pointerFocus = useRef(false);
  const typeahead = useRef({ text: '', time: 0 });
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

  // Row height follows the density, the scale, enlarged text and coarse pointers; it is read from
  // a row.
  const hasItems = items.length > 0;
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => {
      setViewportHeight(element.clientHeight);
      const row = element.querySelector<HTMLElement>('.env-tree-item');
      // The layout height, exact and unaffected by transforms such as a dialog scaling in, which
      // getBoundingClientRect would include. Rows are border-box with a fixed block size.
      const height = row ? parseFloat(getComputedStyle(row).blockSize) : 0;
      if (height) setRowHeight(height);
      else setRowHeight(rowRem[density] * remPixels());
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [density, hasItems]);

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
    if (!item.disabled) onAction(item, { preview });
  }

  function setExpanded(item: T, expanded: boolean) {
    if (!item.disabled) onExpandedChange(item, expanded);
  }

  function findByText(key: string) {
    const now = performance.now();
    const state = typeahead.current;
    state.text = now - state.time > typeaheadTimeout ? key : state.text + key;
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
    // Keys with Alt, Ctrl or ⌘ belong to the application, such as Alt+← for going back.
    if (event.altKey || event.ctrlKey || event.metaKey) return;
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
        const rtl = isRightToLeft(event.currentTarget);
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
        const typing = performance.now() - typeahead.current.time <= typeaheadTimeout;
        if (typing && typeahead.current.text) {
          const index = findByText(event.key);
          if (index !== -1) activate(index);
        } else open(activeItem, true);
        break;
      }
      default:
        handled = false;
        if (event.key.length === 1) {
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
    const row = (event.target as Element).closest<HTMLElement>('.env-tree-item');
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
  const shownHeight = viewportHeight || unmeasuredRows * rowHeight;
  const last = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + shownHeight) / rowHeight) + overscan,
  );
  const indexes: number[] = [];
  for (let index = first; index <= last; index += 1) indexes.push(index);
  if (activeIndex !== -1 && (activeIndex < first || activeIndex > last)) indexes.push(activeIndex);

  const tree = (
    <div
      ref={(node: HTMLDivElement | null) => {
        container.current = node;
        setRef(ref, node);
      }}
      style={style}
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
              className="env-tree-item"
              data-id={item.id}
              data-highlighted={index === activeIndex ? '' : undefined}
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
                  <span className="env-icon">
                    <ChevronRight />
                  </span>
                )}
              </span>
              {item.icon != null && (
                <span className="env-icon env-tree-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="env-tree-label">{item.label}</span>
              {item.description != null && (
                <>
                  {' '}
                  <span className="env-tree-description">{item.description}</span>
                </>
              )}
              {item.end != null && <span className="env-tree-end">{item.end}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!contextMenu) return tree;
  return (
    <ContextMenu
      aria-label={contextMenuLabel ?? messages.actions}
      content={(target) => {
        const id = target?.closest<HTMLElement>('.env-tree-item')?.dataset.id;
        const index = id === undefined ? undefined : indexById.get(id);
        return contextMenu(index === undefined ? null : items[index]!);
      }}
    >
      {tree}
    </ContextMenu>
  );
}
