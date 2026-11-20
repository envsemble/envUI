'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import type { MouseEvent, ReactNode, Ref } from 'react';
import { Grid } from '../../layout/Layout.js';
import { ListRow, shownLabelText } from '../../internal/popup/ListRow.js';
import type { CommandPaletteGroup, CommandPaletteItem } from '../CommandPalette.js';
import '../../styles/Base.css';
import '../../styles/CommandPalette.css';

export interface CommandPaletteSection {
  id: string;
  heading: ReactNode;
  items: readonly CommandPaletteItem[];
}

export type SectionsBaseUiTakesAsItsGroups = readonly CommandPaletteItem[];

function isGroup(entry: CommandPaletteItem | CommandPaletteGroup): entry is CommandPaletteGroup {
  return Array.isArray(entry.items);
}

export function sectionsOf(
  entries: readonly CommandPaletteItem[] | readonly CommandPaletteGroup[],
): CommandPaletteSection[] {
  const groups = entries.filter(isGroup);
  if (groups.length === 0)
    return entries.length === 0
      ? []
      : [{ id: 'section-0', heading: undefined, items: entries as readonly CommandPaletteItem[] }];
  return groups
    .map((group, index) => ({ id: `section-${index}`, heading: group.label, items: group.items }))
    .filter((section) => section.items.length > 0);
}

export function textOf(item: CommandPaletteItem, list: HTMLElement | null) {
  if (item.textValue !== undefined) return item.textValue;
  if (typeof item.label === 'string' || typeof item.label === 'number') return String(item.label);
  const option = Array.from(list?.querySelectorAll('[data-item-id]') ?? []).find(
    (element) => element.getAttribute('data-item-id') === item.id,
  );
  return (option && shownLabelText(option)) ?? '';
}

export function CommandPaletteOptions({
  grouped,
  label,
  loading,
  empty,
  listRef,
  onAct,
}: {
  grouped: boolean;
  label: string;
  loading: boolean;
  empty: boolean;
  listRef: Ref<HTMLDivElement>;
  onAct: (item: CommandPaletteItem, modifier: boolean) => void;
}) {
  const renderItem = (item: CommandPaletteItem) => (
    <ListRow
      key={item.id}
      className="env-command-palette-item"
      start={item.start}
      label={item.label}
      description={item.description}
      end={item.end}
      render={
        <BaseAutocomplete.Item
          {...item.itemProps}
          value={item}
          disabled={item.disabled}
          data-item-id={item.id}
          aria-label={item.textValue}
          onClick={(event: MouseEvent<HTMLDivElement>) => {
            item.itemProps?.onClick?.(event);
            onAct(item, event.ctrlKey || event.metaKey);
          }}
        />
      }
    />
  );
  return (
    <BaseAutocomplete.List
      ref={listRef}
      render={<Grid />}
      className="env-command-palette-list"
      aria-label={label}
      aria-busy={loading || undefined}
      hidden={empty}
    >
      {grouped
        ? (section: CommandPaletteSection) =>
            section.heading == null ? (
              <BaseAutocomplete.Group key={section.id} items={section.items}>
                <BaseAutocomplete.Collection>{renderItem}</BaseAutocomplete.Collection>
              </BaseAutocomplete.Group>
            ) : (
              <BaseAutocomplete.Group
                key={section.id}
                items={section.items}
                render={<Grid />}
                className="env-command-palette-group"
              >
                <BaseAutocomplete.GroupLabel className="env-command-palette-group-label">
                  {section.heading}
                </BaseAutocomplete.GroupLabel>
                <BaseAutocomplete.Collection>{renderItem}</BaseAutocomplete.Collection>
              </BaseAutocomplete.Group>
            )
        : renderItem}
    </BaseAutocomplete.List>
  );
}
