import type { ComponentPropsWithoutRef } from 'react';

export type ListItemElementProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'id' | 'role' | 'tabIndex' | 'dangerouslySetInnerHTML' | `aria-${string}`
> & { [attribute: `data-${string}`]: string | number | boolean | undefined };

interface ListItem {
  items?: never;
}

interface ListGroup<Item> {
  items: readonly Item[];
}

export function isGroup<Item extends ListItem, Group extends ListGroup<Item>>(
  entry: Item | Group,
): entry is Group {
  return Array.isArray(entry.items);
}

export function flattenGroups<Item extends ListItem, Group extends ListGroup<Item>>(
  entries: readonly Item[] | readonly Group[],
): Item[] {
  return entries.flatMap((entry: Item | Group) => (isGroup(entry) ? entry.items : [entry]));
}
