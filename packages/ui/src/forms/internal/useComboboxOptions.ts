'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  flattenItems,
  isGroup,
  type ComboboxFilter,
  type ComboboxGroup,
  type ComboboxItem,
} from './comboboxItems.js';

/**
 * A combobox's options as Base UI reads them: their collection, the filter, and the options known
 * by value. Chosen options stay labelled while the options change, such as with each server search.
 */
export function useComboboxOptions<Item extends ComboboxItem>({
  items,
  filter,
  locale,
  selectedValues,
}: {
  items: readonly Item[] | readonly ComboboxGroup<Item>[];
  filter: ComboboxFilter<Item> | null | undefined;
  locale: string | undefined;
  selectedValues: readonly string[];
}) {
  const flatItems = useMemo(() => flattenItems(items), [items]);
  const selectedKey = selectedValues.join('\u0000');
  // The options known at the last render, which keep labelling the values still chosen.
  const knownBefore = useRef(new Map<string, Item>());
  const known = useMemo(() => {
    const map = new Map(flatItems.map((item) => [item.value, item] as const));
    for (const selected of selectedKey ? selectedKey.split('\u0000') : []) {
      const previous = knownBefore.current.get(selected);
      if (!map.has(selected) && previous) map.set(selected, previous);
    }
    return map;
  }, [flatItems, selectedKey]);
  useLayoutEffect(() => {
    knownBefore.current = known;
  });
  const collection = useMemo(
    () =>
      BaseCombobox.createItems<Item, string>(
        // Base UI's check that an option has no items array of its own, which would mark a group,
        // can't resolve for a generic Item; ComboboxItem has none.
        items as Parameters<typeof BaseCombobox.createItems<Item, string>>[0],
        { getValue: (item) => item.value, getLabel: (item) => item.label },
      ),
    [items],
  );

  const matcher = BaseCombobox.useFilter({ locale, multiple: true });
  const baseFilter = useMemo(
    () =>
      filter === null
        ? null
        : (filter ??
          ((item: Item, query: string) =>
            matcher.contains(item.label, query) ||
            (item.description != null && matcher.contains(item.description, query)))),
    [filter, matcher],
  );

  return {
    known,
    /** A value's label, or the value itself for an option never seen. */
    labelOf: (selected: string) => known.get(selected)?.label ?? selected,
    collection,
    filter: baseFilter,
    /** Whether an option has start content, for which every option keeps room. */
    hasStart: flatItems.some((item) => item.start != null),
    grouped: flatItems.length > 0 && isGroup(items[0]!),
  };
}
