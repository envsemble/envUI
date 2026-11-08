'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { IconButton } from '../../actions/Button.js';
import { IconChevronRight } from '../../icons/ChevronRight.js';
import { IconClose } from '../../icons/Close.js';

/**
 * The actions at the end of a combobox's well, which reserves room for them: the clear button and
 * the trigger that opens the list.
 */
export function ComboboxActions({
  clearName,
  showClear,
  labelId,
  ariaLabel,
}: {
  clearName: string;
  showClear: boolean;
  /** The id of the field's label, which names the trigger; undefined for a field without one. */
  labelId: string | undefined;
  /** The field's aria-label, which names the trigger where the field has no label. */
  ariaLabel: string | undefined;
}) {
  return (
    <span className="env-text-field-end env-combobox-end">
      {showClear && (
        <BaseCombobox.Clear
          className="env-combobox-clear"
          render={
            <IconButton
              variant="ghost"
              icon={<IconClose />}
              aria-label={clearName}
              title={clearName}
            />
          }
        />
      )}
      <BaseCombobox.Trigger
        className="env-combobox-trigger"
        {...(labelId !== undefined ? { 'aria-labelledby': labelId } : {})}
        // Base UI's Field gives it the field's description and error, which the input already
        // announces; the chevron leaves them out.
        render={({
          'aria-describedby': _describedBy,
          'aria-invalid': _invalid,
          ...triggerProps
        }) => (
          <IconButton
            {...triggerProps}
            variant="ghost"
            icon={<IconChevronRight />}
            // IconButton requires a name; aria-labelledby gives it one where the label is undefined.
            {...({ 'aria-label': labelId !== undefined ? undefined : ariaLabel } as {
              'aria-label': string;
            })}
          />
        )}
      />
    </span>
  );
}
