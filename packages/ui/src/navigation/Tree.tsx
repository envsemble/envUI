'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { mergeRefs } from '../internal/react/setRef.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { tree as treeMessages } from '../foundations/messages/tree.js';
import type { RowDensity } from '../foundations/Theme.js';
import { ContextMenu } from '../actions/ContextMenu.js';
import { isRightToLeft } from '../internal/dom/direction.js';
import { rowElementId, siblingPositions, treeKeyAction } from './internal/tree/treeModel.js';
import { placeRows, TreeRow } from './internal/tree/TreeRow.js';
import { useTreeTransitions } from './internal/tree/useTreeTransitions.js';
import { useTreeViewport } from './internal/tree/useTreeViewport.js';
import { flag } from '../internal/flag.js';
import { chainHandlers } from '../internal/react/chainHandlers.js';
import type { TypedText } from '../internal/typeahead.js';
import { labelText } from '../internal/text/labelText.js';
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
   * The row's name: text, or content such as a name with its matched letters highlighted. It keeps
   * its room before the description and the end, and ends with an ellipsis only where the row is
   * too narrow for it alone. Type-ahead matches its text.
   */
  label: ReactNode;
  /**
   * The row's name as plain text, which type-ahead matches, where the label's text isn't it.
   * @default the label when it is a string, else the label's rendered text
   */
  textValue?: string;
  /**
   * Content before the label, such as IconFolder or IconDescription: an envUI icon takes the control
   * icon size and other content keeps its own. It is hidden from assistive technology, since the
   * label names the item.
   */
  start?: ReactNode;
  /**
   * Muted text after the label, such as a status or a path. It gives way first, to an ellipsis and
   * then out of the row, where the row runs out of room, and is read with the label.
   */
  description?: ReactNode;
  /**
   * Content at the end of the row, such as a Badge with a count, which keeps its size. It gives way
   * to the label: where both don't fit, it leaves the row whole rather than squeeze the name. It
   * is read with the label.
   */
  end?: ReactNode;
  /** The row's native tooltip, such as the full path of a truncated name. */
  tooltip?: string;
  /**
   * The row is dimmed and reports aria-disabled: the keyboard still reaches it, but it neither
   * opens nor expands.
   */
  disabled?: boolean;
  /**
   * The row element's own props, such as a className, data attributes for its state, draggable and
   * drag handlers for moving files. The tree's role, id, ARIA attributes and title stay its own.
   */
  itemProps?: TreeItemElementProps;
}

/** What a Tree row's itemProps can set on the row element. */
export type TreeItemElementProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'id' | 'role' | 'title' | 'dangerouslySetInnerHTML' | `aria-${string}`
> & { [attribute: `data-${string}`]: string | number | boolean | undefined };

/** What Tree's onAction receives beside the row. */
export interface TreeActionDetails {
  /**
   * True for a single click and Space, which preview the item, such as in a preview tab; false for
   * a double click and Enter, which open it to keep.
   */
  preview: boolean;
}

const startingShiftAppliesAtOnce = 'none';

export interface TreeProps<Item extends TreeItem> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'aria-label' | 'contextMenu'
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

/**
 * A virtualized tree of rows for large hierarchies such as file trees. The application passes the
 * visible rows and owns expansion and selection; the tree owns focus, keyboard navigation and
 * scrolling. It fills its parent's height, scrolls itself and renders only the rows in view.
 */
export function Tree<Item extends TreeItem>({
  items,
  'aria-label': label,
  value: selectedValue = null,
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
  onPointerDown: ownPointerDown,
  onClick: ownClick,
  onDoubleClick: ownDoubleClick,
  onContextMenu: ownContextMenu,
  ...props
}: TreeProps<Item>) {
  const messages = useMessages('tree', treeMessages);
  const treeId = useId().replace(/[^A-Za-z0-9-]/g, '');
  const container = useRef<HTMLDivElement>(null);
  const [activeValue, setActiveValue] = useState<string | null>(selectedValue);
  const [focusVisible, setFocusVisible] = useState(false);
  const pointerFocus = useRef(false);
  const typeahead = useRef<TypedText>({ text: '', at: 0 });

  const indexByValue = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item, index) => map.set(item.value, index));
    return map;
  }, [items]);
  const { positions, sizes } = useMemo(() => siblingPositions(items), [items]);
  const { rowsElement, arriving, motion, moving } = useTreeTransitions(items);

  const fallbackActiveIndex = useRef(0);
  const selectedIndex = selectedValue === null ? undefined : indexByValue.get(selectedValue);
  let activeIndex = activeValue === null ? -1 : (indexByValue.get(activeValue) ?? -1);
  if (activeIndex === -1 && items.length > 0)
    activeIndex = selectedIndex ?? Math.min(fallbackActiveIndex.current, items.length - 1);
  fallbackActiveIndex.current = Math.max(activeIndex, 0);
  const activeItem = activeIndex === -1 ? undefined : items[activeIndex];

  const { rowHeight, pageRows, indexes, inView, scrollToIndex, onScroll } = useTreeViewport({
    containerRef: container,
    density,
    count: items.length,
    activeIndex,
    selectedIndex,
    selectedValue,
  });

  useEffect(() => {
    if (selectedValue !== null) setActiveValue(selectedValue);
  }, [selectedValue]);

  function activate(index: number) {
    const at = Math.max(0, Math.min(items.length - 1, index));
    const item = items[at];
    if (!item) return;
    setActiveValue(item.value);
    scrollToIndex(at);
  }

  function open(item: Item, preview: boolean) {
    if (!item.disabled) onAction(item, { preview });
  }

  function setExpanded(item: Item, expanded: boolean) {
    if (!item.disabled) onExpandedChange(item, expanded);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || !activeItem) return;
    const keyBelongsToApplication = event.altKey || event.ctrlKey || event.metaKey;
    if (keyBelongsToApplication) return;
    const action = treeKeyAction(
      event.key,
      items,
      activeIndex,
      pageRows,
      isRightToLeft(event.currentTarget),
      typeahead.current,
      (item) =>
        labelText(
          item.label,
          item.textValue,
          document
            .getElementById(rowElementId(treeId, item.value))
            ?.querySelector('.env-tree-label'),
        ),
    );
    if (!action) return;
    if (action.kind === 'move') activate(action.index);
    else if (action.kind === 'expand') setExpanded(activeItem, action.expanded);
    else if (action.kind === 'open') open(activeItem, action.preview);
    event.preventDefault();
    setFocusVisible(true);
  }

  function rowFromEvent(event: MouseEvent<HTMLElement>) {
    const row = (event.target as Element).closest<HTMLElement>('.env-tree-item');
    const index = row?.dataset.id === undefined ? undefined : indexByValue.get(row.dataset.id);
    return index === undefined ? undefined : items[index];
  }

  function onRowClick(event: MouseEvent<HTMLElement>) {
    const item = rowFromEvent(event);
    if (!item) return;
    setActiveValue(item.value);
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

  const row = (item: Item, index: number, top: number, leaving = false) => (
    <TreeRow
      key={item.value}
      item={item}
      id={rowElementId(treeId, item.value)}
      position={positions[index]}
      setSize={sizes[index]}
      selected={item.value === selectedValue}
      highlighted={index === activeIndex}
      arriving={arriving.has(item.value)}
      top={top}
      leaving={leaving}
    />
  );

  const { rows, shift } = placeRows({ items, indexes, motion, moving, rowHeight, inView, row });

  const tree = (
    <div
      {...props}
      ref={mergeRefs(container, ref)}
      role="tree"
      aria-label={label}
      aria-activedescendant={activeItem ? rowElementId(treeId, activeItem.value) : undefined}
      tabIndex={0}
      className={classNames('env-tree', className)}
      data-density={density}
      data-focus-visible={flag(focusVisible)}
      onKeyDown={chainHandlers(ownKeyDown, onKeyDown)}
      onScroll={(event) => {
        ownScroll?.(event);
        onScroll(event.currentTarget.scrollTop);
      }}
      onPointerDown={(event) => {
        ownPointerDown?.(event);
        pointerFocus.current = true;
        setFocusVisible(false);
      }}
      onFocus={(event) => {
        ownFocus?.(event);
        if (event.target === event.currentTarget) setFocusVisible(!pointerFocus.current);
        pointerFocus.current = false;
      }}
      onClick={chainHandlers(ownClick, onRowClick)}
      onDoubleClick={chainHandlers(ownDoubleClick, onRowDoubleClick)}
      onContextMenu={(event) => {
        ownContextMenu?.(event);
        const item = rowFromEvent(event);
        if (item) setActiveValue(item.value);
      }}
    >
      <div
        ref={rowsElement}
        className="env-tree-rows"
        style={{
          blockSize: items.length * rowHeight,
          '--_tree-shift': `${shift}px`,
          transition: shift ? startingShiftAppliesAtOnce : undefined,
        }}
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
        const value = target?.closest<HTMLElement>('.env-tree-item')?.dataset.id;
        const index = value === undefined ? undefined : indexByValue.get(value);
        return contextMenu(index === undefined ? null : items[index]);
      }}
    >
      {tree}
    </ContextMenu>
  );
}
