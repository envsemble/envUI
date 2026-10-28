import type { ComboboxGroup, ComboboxItem } from '../Combobox.js';

/** A chosen value the field never saw among the options stands for itself, as its chip shows. */
export function standIn<Item extends ComboboxItem>(value: string) {
  return { value, label: value } as Item;
}

/** Whether an entry of the options is a group of them. */
export function isGroup<Item extends ComboboxItem>(
  entry: Item | ComboboxGroup<Item>,
): entry is ComboboxGroup<Item> {
  return Array.isArray((entry as ComboboxGroup<Item>).items);
}

/** The options, out of their groups. */
export function flattenItems<Item extends ComboboxItem>(
  items: readonly Item[] | readonly ComboboxGroup<Item>[],
) {
  return (items as readonly (Item | ComboboxGroup<Item>)[]).flatMap((entry) =>
    isGroup(entry) ? entry.items : [entry],
  );
}
