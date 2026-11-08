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
export function isTyping(typed: TypedText) {
  return performance.now() - typed.time <= typeaheadTimeout;
}

/**
 * Adds a key to the text typed ahead and returns the index of the row it names, or -1. A repeated
 * first letter cycles through matches from the row after the active one; longer text refines the
 * current match.
 */
export function findTypedRow(
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
export function parentIndex(items: readonly TreeItem[], index: number) {
  const depth = items[index]!.depth;
  for (let above = index - 1; above >= 0; above -= 1) if (items[above]!.depth < depth) return above;
  return -1;
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
