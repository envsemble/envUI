// A Combobox's options: their types, which Combobox.tsx exports, and the functions on them.
import type { ReactNode } from 'react';

/** One option of a Combobox. */
export interface ComboboxItem {
  /** Stable identifier: the value the field reports and submits. */
  value: string;
  /** Names the option; the field shows it once chosen, and the default filter matches it. */
  label: string;
  /** A muted second line, such as an e-mail address; the default filter matches it too. */
  description?: string;
  /** Content before the label, such as an Avatar or an icon; it takes the size of its slot. */
  start?: ReactNode;
  /** The option shows but can't be chosen. */
  disabled?: boolean;
  /** Reserved: an entry with an `items` array is a group, so an option has none. */
  items?: never;
}

/** Options under a heading, which also names the group for assistive technology. */
export interface ComboboxGroup<Item extends ComboboxItem = ComboboxItem> {
  /** The group's heading. */
  label: string;
  /** The options under the heading, in display order. */
  items: readonly Item[];
}

/** Whether an option matches the text typed into the field. */
export type ComboboxFilter<Item extends ComboboxItem = ComboboxItem> = (
  item: Item,
  query: string,
) => boolean;

/** Whether an entry of the options is a group of them. */
export function isGroup<Item extends ComboboxItem>(
  entry: Item | ComboboxGroup<Item>,
): entry is ComboboxGroup<Item> {
  return Array.isArray(entry.items);
}

/** The options, out of their groups. */
export function flattenItems<Item extends ComboboxItem>(
  items: readonly Item[] | readonly ComboboxGroup<Item>[],
) {
  return items.flatMap((entry: Item | ComboboxGroup<Item>) =>
    isGroup(entry) ? entry.items : [entry],
  );
}
