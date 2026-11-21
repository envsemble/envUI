'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ReactNode, Ref } from 'react';
import type { Direction } from '../../internal/provider/EnvUIContext.js';
import { PopupSurface } from '../../internal/popup/PopupSurface.js';
import { ListRow } from '../../internal/popup/ListRow.js';
import { Column, Grid } from '../../layout/Layout.js';
import { Spinner } from '../../feedback/Spinner.js';
import { IconCheck } from '../../icons/Check.js';
import { isGroup } from '../../internal/popup/listEntries.js';
import type { ComboboxGroup, ComboboxItem } from './comboboxItems.js';
import '../../styles/Base.css';
import '../../styles/Combobox.css';

const popupParts = {
  Portal: BaseCombobox.Portal,
  Positioner: BaseCombobox.Positioner,
  Popup: BaseCombobox.Popup,
};

export function ComboboxPopup<Item extends ComboboxItem>({
  popupRef,
  direction,
  loading,
  loadingLabel,
  emptyLabel,
  startSlot,
}: {
  popupRef: Ref<HTMLDivElement>;
  direction: Direction;
  loading: boolean;
  loadingLabel: ReactNode;
  emptyLabel: ReactNode;
  startSlot: boolean;
}) {
  return (
    <PopupSurface
      parts={popupParts}
      side="bottom"
      align="start"
      dir={direction}
      className="env-combobox-popup"
      layout={<Column padding={1} />}
      popupProps={{ ref: popupRef }}
    >
      <BaseCombobox.Status className="env-combobox-status">
        {loading ? (
          <>
            <Spinner size="sm" />
            {loadingLabel}
          </>
        ) : null}
      </BaseCombobox.Status>
      <BaseCombobox.Empty className="env-combobox-empty">
        {loading ? null : emptyLabel}
      </BaseCombobox.Empty>
      <BaseCombobox.List
        render={<Grid />}
        className="env-combobox-list"
        aria-busy={loading || undefined}
      >
        {(entry: Item | ComboboxGroup<Item>, index: number) =>
          isGroup(entry) ? (
            <BaseCombobox.Group
              key={index}
              items={entry.items}
              render={<Grid />}
              className="env-combobox-group"
            >
              <BaseCombobox.GroupLabel className="env-combobox-group-label">
                {entry.label}
              </BaseCombobox.GroupLabel>
              <BaseCombobox.Collection>
                {(item: Item) => (
                  <ComboboxOption key={item.value} item={item} startSlot={startSlot} />
                )}
              </BaseCombobox.Collection>
            </BaseCombobox.Group>
          ) : (
            <ComboboxOption key={entry.value} item={entry} startSlot={startSlot} />
          )
        }
      </BaseCombobox.List>
    </PopupSurface>
  );
}

function ComboboxOption<Item extends ComboboxItem>({
  item,
  startSlot,
}: {
  item: Item;
  startSlot: boolean;
}) {
  return (
    <ListRow
      render={<BaseCombobox.Item {...item.itemProps} value={item.value} disabled={item.disabled} />}
      className="env-combobox-item"
      indicator={
        <BaseCombobox.ItemIndicator className="env-icon env-combobox-item-indicator">
          <IconCheck />
        </BaseCombobox.ItemIndicator>
      }
      start={startSlot ? <span className="env-combobox-start">{item.start}</span> : undefined}
      label={item.label}
      end={item.end}
      description={item.description || undefined}
    />
  );
}
