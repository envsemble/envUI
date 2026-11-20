'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { flattenGroups } from '../../internal/list/listEntries.js';
import { type ComboboxFilter, type ComboboxGroup, type ComboboxItem } from './comboboxItems.js';

type GroupsBaseUiCannotTellFromGenericItems<Item extends ComboboxItem> = Parameters<
  typeof BaseCombobox.createItems<Item, string>
>[0];

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
  const flatItems = useMemo(() => flattenGroups(items), [items]);
  const knownAtLastRender = useRef(new Map<string, Item>());
  const known = useMemo(() => {
    const map = new Map(flatItems.map((item) => [item.value, item] as const));
    for (const selected of selectedValues) {
      const previous = knownAtLastRender.current.get(selected);
      if (!map.has(selected) && previous) map.set(selected, previous);
    }
    return map;
  }, [flatItems, selectedValues]);
  useLayoutEffect(() => {
    knownAtLastRender.current = known;
  });
  const collection = useMemo(
    () =>
      BaseCombobox.createItems<Item, string>(
        items as GroupsBaseUiCannotTellFromGenericItems<Item>,
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
    labelOf: (selected: string) => known.get(selected)?.label ?? selected,
    collection,
    filter: baseFilter,
    hasStart: flatItems.some((item) => item.start != null),
  };
}
