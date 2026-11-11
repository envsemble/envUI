'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import type { MouseEvent, Ref } from 'react';
import { Grid } from '../../layout/Layout.js';
import { ListRow } from '../../internal/popup/ListRow.js';
import type { CommandPaletteItem } from '../CommandPalette.js';
import '../../styles/Base.css';
import '../../styles/CommandPalette.css';

/** A run of consecutive items with the same group. */
export interface CommandPaletteSection {
  id: string;
  label: string | undefined;
  items: CommandPaletteItem[];
}

/** Consecutive items with the same group share a labelled group. */
export function sectionsOf(items: readonly CommandPaletteItem[]) {
  const sections: CommandPaletteSection[] = [];
  for (const item of items) {
    const current = sections.at(-1);
    if (current && current.label === item.group) current.items.push(item);
    else sections.push({ id: `section-${sections.length}`, label: item.group, items: [item] });
  }
  return sections;
}

/** An item's text, which Autocomplete reads for its value and typeahead. */
export function textOf(item: CommandPaletteItem) {
  return item.textValue ?? (typeof item.label === 'string' ? item.label : item.id);
}

/**
 * CommandPalette's list of options, grouped under headings where its items have groups; `onAct`
 * receives the pressed option and whether Ctrl or Cmd was held.
 */
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
      icon={item.icon}
      label={item.label}
      description={item.description}
      end={item.end}
      render={
        <BaseAutocomplete.Item
          value={item}
          disabled={item.disabled}
          data-item-id={item.id}
          aria-label={item.textValue}
          onClick={(event: MouseEvent) => onAct(item, event.ctrlKey || event.metaKey)}
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
            section.label === undefined ? (
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
                  {section.label}
                </BaseAutocomplete.GroupLabel>
                <BaseAutocomplete.Collection>{renderItem}</BaseAutocomplete.Collection>
              </BaseAutocomplete.Group>
            )
        : renderItem}
    </BaseAutocomplete.List>
  );
}
