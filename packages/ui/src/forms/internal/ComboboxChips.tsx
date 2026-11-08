'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { IconButton } from '../../actions/Button.js';
import { IconClose } from '../../icons/Close.js';
import type { ComboboxItem } from '../Combobox.js';

/** The chosen options of a combobox that takes several, as chips in its field. */
export function ComboboxChips({
  values,
  known,
  labelOf,
  removeName,
  editable,
}: {
  values: readonly string[];
  known: ReadonlyMap<string, ComboboxItem>;
  labelOf: (value: string) => string;
  removeName: (label: string) => string;
  /** Whether each chip has a remove button. */
  editable: boolean;
}) {
  return values.map((selected) => {
    const item = known.get(selected);
    const text = labelOf(selected);
    return (
      <BaseCombobox.Chip
        key={selected}
        className="env-combobox-chip"
        // A chip is no widget, so the field's read-only state is the input's alone.
        render={({ 'aria-readonly': _readOnly, ...chipProps }) => <div {...chipProps} />}
      >
        {item?.start != null && (
          <span className="env-combobox-start" aria-hidden="true">
            {item.start}
          </span>
        )}
        <span className="env-combobox-chip-label">{text}</span>
        {editable && (
          <BaseCombobox.ChipRemove
            className="env-combobox-chip-remove"
            render={
              <IconButton variant="ghost" icon={<IconClose />} aria-label={removeName(text)} />
            }
          />
        )}
      </BaseCombobox.Chip>
    );
  });
}
