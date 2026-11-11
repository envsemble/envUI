import type { ReactNode } from 'react';
import { flag } from '../../internal/flag.js';
import { IconChevronRight } from '../../icons/ChevronRight.js';
import type { TreeItem } from '../Tree.js';
import type { TreeMotion } from './treeModel.js';
import '../../styles/Base.css';
import '../../styles/Tree.css';

/**
 * A tree's row, placed top pixels down its parent. A leaving row, in a group that collapses, is only
 * shown: it has no id, position or highlight.
 */
export function TreeRow({
  item,
  id,
  position,
  setSize,
  selected,
  highlighted,
  arriving,
  top,
  leaving,
}: {
  item: TreeItem;
  id: string;
  /** The row's position among its siblings, and their count. */
  position: number | undefined;
  setSize: number | undefined;
  selected: boolean;
  highlighted: boolean;
  /** The row arrives with new items and fades in from its starting style. */
  arriving: boolean;
  top: number;
  leaving: boolean;
}) {
  return (
    <div
      id={leaving ? undefined : id}
      role="treeitem"
      aria-level={item.depth + 1}
      aria-posinset={leaving ? undefined : position}
      aria-setsize={leaving ? undefined : setSize}
      aria-expanded={item.expandable ? Boolean(item.expanded) : undefined}
      aria-selected={selected}
      aria-disabled={item.disabled || undefined}
      title={item.tooltip}
      className="env-tree-item"
      data-id={item.value}
      data-highlighted={flag(!leaving && highlighted)}
      data-starting-style={flag(arriving)}
      style={{
        '--env-tree-depth': item.depth,
        transform: `translateY(${top}px)`,
      }}
    >
      <span className="env-tree-chevron" aria-hidden="true" data-expanded={flag(item.expanded)}>
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

/**
 * The rows in the document, each placed at its index. While a row expands or collapses, its rows
 * sit in a group that grows or shrinks from the row's end, and the rows below follow the group's
 * end: they start where they were, moved by the shift, which eases to 0.
 */
export function placeRows<Item extends TreeItem>({
  items,
  indexes,
  motion,
  moving,
  rowHeight,
  inView,
  row,
}: {
  items: readonly Item[];
  /** The indexes of the rows in the document, in order. */
  indexes: readonly number[];
  motion: TreeMotion<Item> | null;
  /** Whether the motion moves the rows to where they go, after a render where they were. */
  moving: boolean;
  rowHeight: number;
  inView: (index: number) => boolean;
  /** A row at its index, placed top pixels down its parent; a leaving row is only shown. */
  row: (item: Item, index: number, top: number, leaving?: boolean) => ReactNode;
}): { rows: ReactNode; shift: number } {
  const placed = (index: number) => row(items[index]!, index, index * rowHeight);
  if (!motion) return { rows: indexes.map(placed), shift: 0 };
  const { kind, start, rows: groupRows } = motion;
  const size = groupRows.length;
  const groupEnd = kind === 'open' ? start + size : start;
  const shift = moving ? 0 : (kind === 'open' ? -size : size) * rowHeight;
  const rows = (
    <>
      {indexes.filter((index) => index < start).map(placed)}
      <div
        className="env-tree-group"
        aria-hidden={kind === 'close' || undefined}
        inert={kind === 'close'}
        data-starting-style={flag(kind === 'open' && !moving)}
        data-ending-style={flag(kind === 'close' && moving)}
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
      {indexes.filter((index) => index >= groupEnd).map(placed)}
    </>
  );
  return { rows, shift };
}
