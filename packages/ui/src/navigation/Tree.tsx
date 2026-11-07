'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { typeaheadTimeout } from '../internal/typeahead.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { tree as treeMessages } from '../foundations/messages/tree.js';
import type { RowDensity } from '../foundations/Theme.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import { ContextMenu } from './ContextMenu.js';
import { remPixels } from '../internal/lengths.js';
import { isRightToLeft } from '../internal/direction.js';
import '../styles/Base.css';
import '../styles/Tree.css';

export interface TreeItem {
  /** The row's value, a stable, unique identifier, which the tree's value names; rows carry it as data-id. */
  value: string;
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
  tooltip?: string;
  /** The text type-ahead matches, where the label is not a plain string. */
  textValue?: string;
  /**
   * The row is dimmed and reports aria-disabled: the keyboard still reaches it, but it neither
   * opens nor expands.
   */
  disabled?: boolean;
}

/** What Tree's onAction receives beside the row. */
export interface TreeActionDetails {
  /**
   * True for a single click and Space, which preview the item, such as in a preview tab; false for
   * a double click and Enter, which open it to keep.
   */
  preview: boolean;
}

/** The native events the tree handles itself, for its rows; the others reach its element. */
type TreeOwnEvents = 'onClick' | 'onDoubleClick' | 'onContextMenu' | 'onPointerDown';

export interface TreeProps<Item extends TreeItem>
  extends Omit<
    ComponentPropsWithRef<'div'>,
    'children' | 'defaultValue' | 'onChange' | 'aria-label' | 'contextMenu' | TreeOwnEvents
  > {
  /**
   * The visible rows in order, flattened: an expanded row is followed by its visible descendants.
   * The application owns expansion; collapsing a row removes its descendants from items.
   */
  items: readonly Item[];
  /** The tree's accessible name, such as Files. */
  'aria-label': string;
  /**
   * The selected row's value: it takes the navigation selection colors and scrolls into view when it
   * changes. The application sets it, usually from onAction.
   */
  value?: string | null;
  /**
   * Called when people open a row: with preview true on a single click and Space, and false on a
   * double click and Enter. Expandable rows call it too, and disabled rows don't.
   */
  onAction: (item: Item, details: TreeActionDetails) => void;
  /**
   * Called with the row and its new state from a press on its chevron, the right arrow key on a
   * collapsed row and the left arrow key on an expanded one, mirrored in right-to-left text. The
   * application updates items.
   */
  onExpandedChange: (item: Item, expanded: boolean) => void;
  /**
   * Menu items for the row people right-click, or press Shift+F10 or the Menu key on, or for the
   * tree's empty area when the item is null. Without it, the browser's own context menu stays.
   */
  contextMenu?: (item: Item | null) => ReactNode;
  /**
   * The context menu's accessible name.
   * @default 'Actions', or EnvUIProvider's messages.tree.contextMenu
   */
  contextMenuLabel?: string;
  /**
   * How tightly the rows pack: xs, sm, md or lg changes only their block padding, never the text
   * or the icons. In the comfortable scale sm rows are 1.75 rem tall and md rows 2.25 rem. Under a
   * coarse pointer every row is at least 2.75 rem.
   * @default 'sm'
   */
  density?: RowDensity;
}

/** Rows outside the viewport kept rendered above and below it. */
const overscan = 8;
/**
 * The rows a tree renders before it has measured its viewport, such as in the server's markup: as
 * many as a tall pane shows, so the first paint is already full and measuring only adds rows.
 */
const unmeasuredRows = 24;
/** Each density's row height in rem in the comfortable scale, until a row can be measured. */
const rowRem: Record<RowDensity, number> = { xs: 1.5, sm: 1.75, md: 2.25, lg: 2.75 };
/** No rows arriving. */
const noValues: ReadonlySet<string> = new Set();

/**
 * A row expanding or collapsing: the rows it reveals or hides, which grow or shrink as one group
 * from start, the index of its first row, while the rows below follow the group's end.
 */
interface TreeMotion<Item extends TreeItem> {
  kind: 'open' | 'close';
  start: number;
  rows: readonly Item[];
}

/**
 * The motion from one list of rows to the next: rows that arrive as one block among unchanged rows
 * open, and rows that leave as one block close. Any other change, such as new items altogether,
 * has none.
 */
function treeMotion<Item extends TreeItem>(
  before: readonly Item[],
  after: readonly Item[],
): TreeMotion<Item> | null {
  const count = after.length - before.length;
  if (count === 0) return null;
  const [longer, shorter] = count > 0 ? [after, before] : [before, after];
  let start = 0;
  while (start < shorter.length && shorter[start]!.value === longer[start]!.value) start += 1;
  const size = Math.abs(count);
  for (let index = start; index < shorter.length; index += 1) {
    if (shorter[index]!.value !== longer[index + size]!.value) return null;
  }
  return { kind: count > 0 ? 'open' : 'close', start, rows: longer.slice(start, start + size) };
}

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
export function Tree<Item extends TreeItem>({
  items,
  'aria-label': label,
  value: selectedId = null,
  onAction,
  onExpandedChange,
  contextMenu,
  contextMenuLabel,
  density = 'sm',
  className,
  ref,
  onKeyDown: ownKeyDown,
  onScroll: ownScroll,
  onFocus: ownFocus,
  ...props
}: TreeProps<Item>) {
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
    items.forEach((item, index) => map.set(item.value, index));
    return map;
  }, [items]);
  const { positions, sizes } = useMemo(() => siblingPositions(items), [items]);

  // The rows that arrive with new items fade in from their starting style; the first rows, and rows
  // that only scroll into view, show at once. Where a row expands or collapses, its rows instead
  // grow or shrink as one group, as an accordion's panel does, kept until the group has closed.
  // The same rows passed again, as a new list, keep the change that is playing.
  const shownItems = useRef<readonly Item[] | null>(null);
  const lastChange = useRef<{ arriving: ReadonlySet<string>; motion: TreeMotion<Item> | null }>({
    arriving: noValues,
    motion: null,
  });
  const { arriving, motion } = useMemo(() => {
    const before = shownItems.current;
    if (!before) return lastChange.current;
    const same =
      before.length === items.length &&
      before.every((item, index) => item.value === items[index]!.value);
    if (same) return lastChange.current;
    const motion = treeMotion(before, items);
    if (motion) return { arriving: noValues, motion };
    const values = new Set(before.map((item) => item.value));
    return {
      arriving: new Set(items.filter((item) => !values.has(item.value)).map((item) => item.value)),
      motion: null,
    };
  }, [items]);
  useLayoutEffect(() => {
    lastChange.current = { arriving, motion };
  }, [arriving, motion]);
  useLayoutEffect(() => {
    shownItems.current = items;
  }, [items]);
  useLayoutEffect(function arrive() {
    const rows = container.current?.querySelectorAll('.env-tree-item[data-starting-style]');
    if (!rows?.length) return;
    void getComputedStyle(rows[0]!).opacity;
    for (const row of rows) row.removeAttribute('data-starting-style');
  });
  // A motion renders first from where the rows were, then moves to where they go, and ends once its
  // transitions have finished: at once under a reduced-motion preference.
  const rowsElement = useRef<HTMLDivElement>(null);
  const [movingMotion, setMovingMotion] = useState<TreeMotion<Item> | null>(null);
  const [settledMotion, setSettledMotion] = useState<TreeMotion<Item> | null>(null);
  const activeMotion = motion && motion !== settledMotion ? motion : null;
  const moving = activeMotion !== null && activeMotion === movingMotion;
  useLayoutEffect(() => {
    const element = rowsElement.current;
    if (!activeMotion || !element) return;
    // Reading the style makes the browser take the starting positions before they change.
    void getComputedStyle(element).getPropertyValue('--env-tree-shift');
    if (!moving) {
      setMovingMotion(activeMotion);
      return;
    }
    const group = element.querySelector('.env-tree-group');
    const transitions = [...element.getAnimations(), ...(group?.getAnimations() ?? [])];
    let current = true;
    const settle = () => {
      if (current) setSettledMotion(activeMotion);
    };
    void Promise.all(transitions.map((transition) => transition.finished)).then(settle, settle);
    return () => {
      current = false;
    };
  }, [activeMotion, moving]);

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
    setActiveId(item.value);
    scrollToIndex(indexById.get(item.value)!);
  }

  function open(item: Item, preview: boolean) {
    if (!item.disabled) onAction(item, { preview });
  }

  function setExpanded(item: Item, expanded: boolean) {
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
    setActiveId(item.value);
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
  const inView = (index: number) => index >= first && index <= last;
  const indexes: number[] = [];
  for (let index = first; index <= last; index += 1) indexes.push(index);
  if (activeIndex !== -1 && !inView(activeIndex)) {
    indexes.push(activeIndex);
    indexes.sort((a, b) => a - b);
  }

  /** A row at its index, placed top pixels down its parent; a leaving row is only shown. */
  function row(item: Item, index: number, top: number, leaving = false) {
    return (
      <div
        key={item.value}
        id={leaving ? undefined : rowElementId(treeId, item.value)}
        role="treeitem"
        aria-level={item.depth + 1}
        aria-posinset={leaving ? undefined : positions[index]}
        aria-setsize={leaving ? undefined : sizes[index]}
        aria-expanded={item.expandable ? Boolean(item.expanded) : undefined}
        aria-selected={item.value === selectedId}
        aria-disabled={item.disabled || undefined}
        title={item.tooltip}
        className="env-tree-item"
        data-id={item.value}
        data-highlighted={!leaving && index === activeIndex ? '' : undefined}
        data-starting-style={arriving.has(item.value) ? '' : undefined}
        style={
          {
            '--env-tree-depth': item.depth,
            transform: `translateY(${top}px)`,
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
              <IconChevronRight />
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
  }

  // While a row expands or collapses, its rows sit in a group that grows or shrinks from the row's
  // end, and the rows below follow the group's end: they start where they were, moved by the shift,
  // which eases to 0.
  let rows: ReactNode;
  let shift = 0;
  if (activeMotion) {
    const { kind, start, rows: groupRows } = activeMotion;
    const size = groupRows.length;
    const groupEnd = kind === 'open' ? start + size : start;
    if (!moving) shift = (kind === 'open' ? -size : size) * rowHeight;
    rows = (
      <>
        {indexes
          .filter((index) => index < start)
          .map((index) => row(items[index]!, index, index * rowHeight))}
        <div
          className="env-tree-group"
          aria-hidden={kind === 'close' || undefined}
          inert={kind === 'close'}
          data-starting-style={kind === 'open' && !moving ? '' : undefined}
          data-ending-style={kind === 'close' && moving ? '' : undefined}
          style={{
            transform: `translateY(${start * rowHeight}px)`,
            blockSize: `calc(${kind === 'open' ? size * rowHeight : 0}px + var(--env-tree-shift))`,
          }}
        >
          {groupRows.map((item, offset) =>
            inView(start + offset)
              ? row(item, start + offset, offset * rowHeight, kind === 'close')
              : null,
          )}
        </div>
        {indexes
          .filter((index) => index >= groupEnd)
          .map((index) => row(items[index]!, index, index * rowHeight))}
      </>
    );
  } else rows = indexes.map((index) => row(items[index]!, index, index * rowHeight));

  const tree = (
    <div
      {...props}
      ref={(node: HTMLDivElement | null) => {
        container.current = node;
        setRef(ref, node);
      }}
      role="tree"
      aria-label={label}
      aria-activedescendant={activeItem ? rowElementId(treeId, activeItem.value) : undefined}
      tabIndex={0}
      className={classNames('env-tree', className)}
      data-density={density}
      data-focus-visible={focusVisible ? '' : undefined}
      onKeyDown={(event) => {
        ownKeyDown?.(event);
        if (!event.defaultPrevented) onKeyDown(event);
      }}
      onScroll={(event) => {
        ownScroll?.(event);
        setScrollTop(event.currentTarget.scrollTop);
      }}
      onPointerDown={() => {
        pointerFocus.current = true;
        setFocusVisible(false);
      }}
      onFocus={(event) => {
        ownFocus?.(event);
        if (event.target === event.currentTarget) setFocusVisible(!pointerFocus.current);
        pointerFocus.current = false;
      }}
      onClick={onRowClick}
      onDoubleClick={onRowDoubleClick}
      onContextMenu={(event) => {
        const item = rowFromEvent(event);
        if (item) setActiveId(item.value);
      }}
    >
      <div
        ref={rowsElement}
        className="env-tree-rows"
        style={
          {
            blockSize: items.length * rowHeight,
            '--env-tree-shift': `${shift}px`,
            // The starting shift applies at once; only the way back to 0 eases.
            transition: shift ? 'none' : undefined,
          } as CSSProperties
        }
      >
        {rows}
      </div>
    </div>
  );

  if (!contextMenu) return tree;
  return (
    <ContextMenu
      aria-label={contextMenuLabel ?? messages.contextMenu}
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
