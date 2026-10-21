// Placeholder items: stand-ins for data that hasn't arrived, so a page renders its normal components
// over them in a skeleton. Plain functions, so a server component calls them too.

const placeholderMark = Symbol.for('envui.placeholder');

/**
 * Stand-in items for data that is loading, so the page renders its normal components over them
 * while a surface around them is a skeleton: `items ?? placeholders(3)`. Each item has only an
 * `id`, `placeholder-0`, `placeholder-1` and so on, for keys; every other field is undefined, and
 * the components render missing text as bars of a default length for its text style. The item type
 * follows from where the list goes, such as the items it stands in for, so the code that renders
 * real items renders these too; it must tolerate the missing fields, as optional chaining does.
 */
export function placeholders<Item = { id: string }>(count: number): Item[] {
  return Array.from(
    { length: Math.max(0, Math.floor(count)) },
    (_, index) => ({ id: `placeholder-${index}`, [placeholderMark]: true }) as Item,
  );
}

/** Whether an item is one of the stand-ins that `placeholders()` returns. */
export function isPlaceholder(item: unknown): boolean {
  return typeof item === 'object' && item !== null && placeholderMark in item;
}
