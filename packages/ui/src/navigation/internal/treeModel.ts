import { typeaheadTimeout } from '../../internal/typeahead.js';
import type { TreeItem } from '../Tree.js';

/**
 * A row expanding or collapsing: the rows it reveals or hides, which grow or shrink as one group
 * from start, the index of its first row, while the rows below follow the group's end.
 */
export interface TreeMotion<Item extends TreeItem> {
  kind: 'open' | 'close';
  start: number;
  rows: readonly Item[];
}

/**
 * The motion from one list of rows to the next: rows that arrive as one block among unchanged rows
 * open, and rows that leave as one block close. Any other change, such as new items altogether,
 * has none.
 */
export function treeMotion<Item extends TreeItem>(
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
export function rowElementId(treeId: string, itemId: string) {
  return `${treeId}-row-${itemId.replace(
    /[^A-Za-z0-9-]/g,
    (character) => `_${character.codePointAt(0)!.toString(16)}_`,
  )}`;
}

function itemText(item: TreeItem) {
  return item.textValue ?? (typeof item.label === 'string' ? item.label : '');
}

/** The text typed ahead so far, and when its last key was, from performance.now(). */
export interface TypedText {
  text: string;
  time: number;
}

/** Whether a key now adds to the text typed ahead, rather than starting it over. */
function isTyping(typed: TypedText) {
  return performance.now() - typed.time <= typeaheadTimeout;
}

/**
 * Adds a key to the text typed ahead and returns the index of the row it names, or -1. A repeated
 * first letter cycles through matches from the row after the active one; longer text refines the
 * current match.
 */
function findTypedRow(
  items: readonly TreeItem[],
  typed: TypedText,
  key: string,
  activeIndex: number,
) {
  const now = performance.now();
  typed.text = now - typed.time > typeaheadTimeout ? key : typed.text + key;
  typed.time = now;
  const query = typed.text.toLocaleLowerCase();
  const repeated = query.length > 1 && [...query].every((character) => character === query[0]);
  const search = repeated ? query[0]! : query;
  const start = repeated || query.length === 1 ? activeIndex + 1 : activeIndex;
  for (let offset = 0; offset < items.length; offset += 1) {
    const index = (start + offset) % items.length;
    if (itemText(items[index]!).toLocaleLowerCase().startsWith(search)) return index;
  }
  return -1;
}

/** The index of the row's parent, the nearest shallower row above it, or -1 for a top-level row. */
function parentIndex(items: readonly TreeItem[], index: number) {
  const depth = items[index]!.depth;
  for (let above = index - 1; above >= 0; above -= 1) if (items[above]!.depth < depth) return above;
  return -1;
}

/**
 * What a key does in a tree: moves the active row to an index, expands or collapses it, opens it in
 * place or as a preview, or stays, as a typed letter that names no row does. Null for a key that
 * isn't the tree's.
 */
export type TreeKeyAction =
  | { kind: 'move'; index: number }
  | { kind: 'expand'; expanded: boolean }
  | { kind: 'open'; preview: boolean }
  | { kind: 'stay' };

/**
 * The action of a key on the active row, following the WAI-ARIA tree view: the arrows move along
 * the rows and, inward and outward as the text runs, into and out of a level; Home, End and the page
 * keys jump; Enter opens; Space previews, unless it is part of the text typed ahead.
 */
export function treeKeyAction(
  key: string,
  items: readonly TreeItem[],
  active: number,
  pageRows: number,
  rtl: boolean,
  typed: TypedText,
): TreeKeyAction | null {
  const item = items[active];
  if (!item) return null;
  const move = (index: number): TreeKeyAction => ({ kind: 'move', index });
  const typedRow = (): TreeKeyAction => {
    const index = findTypedRow(items, typed, key, active);
    return index === -1 ? { kind: 'stay' } : move(index);
  };
  switch (key) {
    case 'ArrowDown':
      return move(active + 1);
    case 'ArrowUp':
      return move(active - 1);
    case 'Home':
      return move(0);
    case 'End':
      return move(items.length - 1);
    case 'PageDown':
      return move(active + pageRows);
    case 'PageUp':
      return move(active - pageRows);
    case 'ArrowRight':
    case 'ArrowLeft': {
      if ((key === 'ArrowRight') !== rtl) {
        if (item.expandable && !item.expanded) return { kind: 'expand', expanded: true };
        if (item.expanded && items[active + 1]?.depth === item.depth + 1) return move(active + 1);
        return { kind: 'stay' };
      }
      if (item.expandable && item.expanded) return { kind: 'expand', expanded: false };
      const parent = parentIndex(items, active);
      return parent === -1 ? { kind: 'stay' } : move(parent);
    }
    case 'Enter':
      return { kind: 'open', preview: false };
    case ' ':
      // While typing ahead, a space belongs to the typed text.
      return isTyping(typed) && typed.text ? typedRow() : { kind: 'open', preview: true };
    default:
      return key.length === 1 ? typedRow() : null;
  }
}

/** Position and size of each row among its siblings, for aria-posinset and aria-setsize. */
export function siblingPositions(items: readonly TreeItem[]) {
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
