// Placeholder items: stand-ins for data that hasn't arrived, so a page renders its normal components
// over them in a skeleton. Plain functions, so a server component calls them too.

/** The start of every placeholder item's id, which isPlaceholder() reads. */
const placeholderPrefix = 'envui-placeholder-';

/** Marks the placeholder type, so an item of the application's never passes for one. */
declare const placeholderMark: unique symbol;

/**
 * A stand-in for an item that is loading: its `id`, and every other field of the item possibly
 * missing, as it is, so code that reads a field must handle its absence. Only `placeholders()`
 * makes one; the type tells it from an item, so isPlaceholder() narrows either way.
 */
export type Placeholder<Item = object> = { id: string; readonly [placeholderMark]: true } & Partial<
  Omit<Item, 'id'>
>;

/**
 * Stand-in items for data that is loading, so the page renders its normal components over them
 * while a surface around them is a skeleton: `items ?? placeholders<Project>(3)`. Each item has only
 * an `id`, `envui-placeholder-0`, `envui-placeholder-1` and so on, for keys; its other fields are
 * undefined, which the type says, and the components render missing text as bars of a default
 * length for its text style.
 */
export function placeholders<Item = object>(count: number): Placeholder<Item>[] {
  return Array.from(
    { length: Math.max(0, Math.floor(count)) },
    // The mark is in the type only, which tells a placeholder from an item.
    (_, index) => ({ id: `${placeholderPrefix}${index}` }) as Placeholder<Item>,
  );
}

/**
 * Whether an item is one of the stand-ins that `placeholders()` returns, by its id, so it holds
 * after the items are serialized, such as from a server component to a client one. It narrows the
 * type: `isPlaceholder(item) ? <Skeleton /> : item.name`, where item.name is the item's own.
 */
export function isPlaceholder<Item>(item: Item | Placeholder<Item>): item is Placeholder<Item> {
  if (typeof item !== 'object' || item === null || !('id' in item)) return false;
  const { id } = item as { id: unknown };
  return typeof id === 'string' && id.startsWith(placeholderPrefix);
}
