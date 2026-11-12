'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useId, type ReactNode, type Ref } from 'react';
import type { Direction } from '../../internal/provider/EnvUIContext.js';
import { PopupSurface } from '../../internal/popup/PopupSurface.js';
import { ListRow } from '../../internal/list/ListRow.js';
import { Column, Grid } from '../../layout/Layout.js';
import { Spinner } from '../../feedback/Spinner.js';
import { IconCheck } from '../../icons/Check.js';
import { isGroup, type ComboboxGroup, type ComboboxItem } from './comboboxItems.js';
import '../../styles/Base.css';
import '../../styles/Combobox.css';

const popupParts = {
  Portal: BaseCombobox.Portal,
  Positioner: BaseCombobox.Positioner,
  Popup: BaseCombobox.Popup,
};

/** A Combobox's popup: its loading status, its empty state and its options, in groups or not. */
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
  /** Some option has start content, so every row keeps room for it. */
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
      {/* The options are busy while they load, not the popup, whose status announces
          the loading label meanwhile. */}
      <BaseCombobox.List
        render={<Grid />}
        className="env-combobox-list"
        aria-busy={loading || undefined}
      >
        {(entry: Item | ComboboxGroup<Item>) =>
          isGroup(entry) ? (
            <BaseCombobox.Group
              key={entry.label}
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

/** An option row: a check mark slot, optional start content, the label and its description. */
function ComboboxOption<Item extends ComboboxItem>({
  item,
  startSlot,
}: {
  item: Item;
  startSlot: boolean;
}) {
  const descriptionId = useId();
  return (
    <ListRow
      render={
        <BaseCombobox.Item
          value={item.value}
          disabled={item.disabled}
          aria-describedby={item.description ? descriptionId : undefined}
        />
      }
      className="env-combobox-item"
      indicator={
        <BaseCombobox.ItemIndicator className="env-icon env-combobox-item-indicator">
          <IconCheck />
        </BaseCombobox.ItemIndicator>
      }
      icon={startSlot ? <span className="env-combobox-start">{item.start}</span> : undefined}
      label={item.label}
      description={
        item.description ? (
          // Announced through aria-describedby rather than as part of the option's name.
          <span id={descriptionId} aria-hidden="true">
            {item.description}
          </span>
        ) : undefined
      }
    />
  );
}
