import { forwardRef, useEffect, useRef, useState } from 'react';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import type { ButtonHTMLAttributes } from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { classNames } from '../internal/classNames.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { Surface } from '../foundations/Surface.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { Check } from '../icons/Check.js';
import { FieldFrame, type FieldProps } from './internal/FieldFrame.js';
import { setRef } from '../internal/setRef.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
    >,
    FieldProps {
  options: readonly SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  /**
   * The trigger's Button style, to suit its surroundings: secondary (default) for the page canvas,
   * outlined for panes, dialogs, rows and toolbars.
   */
  variant?: 'secondary' | 'outlined';
  /**
   * compact suits dense desktop surfaces: a compact trigger and the compact menu's popup, where a
   * check mark shows the selected option.
   */
  density?: 'standard' | 'compact';
}

/** A single selection with native form participation and a themed popup. */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    name,
    required,
    disabled,
    label,
    hint,
    error,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    placeholder,
    autoComplete,
    variant = 'secondary',
    density = 'standard',
    form,
    id: suppliedId,
    className,
    ...triggerProps
  },
  ref,
) {
  const metadata = useFieldMetadata(suppliedId, hint, error, describedBy, invalid);
  const compact = density === 'compact';
  const { id } = metadata;
  const theme = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? null);
  const selectedValue = value === undefined ? uncontrolledValue : value;
  useEffect(
    function subscribeToFormReset() {
      const input = inputRef.current;
      const ownerForm = input?.form;
      if (!input || !ownerForm) return;
      return subscribeFormReset(ownerForm, function applyReset() {
        const resetValue = value === undefined ? (defaultValue ?? null) : value;
        if (value === undefined) setUncontrolledValue(resetValue);
        input.value = resetValue ?? '';
      });
    },
    [value, defaultValue, form],
  );
  function handleValueChange(nextValue: string | null) {
    if (value === undefined) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  }
  function getPopupOffset() {
    const trigger = triggerRef.current;
    const ownerWindow = trigger?.ownerDocument.defaultView;
    return trigger && ownerWindow
      ? Number.parseFloat(ownerWindow.getComputedStyle(trigger).columnGap) || 0
      : 0;
  }
  return (
    <BaseSelect.Root<string>
      items={options}
      value={selectedValue}
      onValueChange={handleValueChange}
      name={name}
      required={required}
      disabled={disabled}
      form={form}
      autoComplete={autoComplete}
      id={id}
      inputRef={inputRef}
    >
      <FieldFrame
        id={id}
        label={label != null ? <BaseSelect.Label>{label}</BaseSelect.Label> : null}
        hint={hint}
        error={error}
      >
        <BaseSelect.Trigger
          {...triggerProps}
          {...metadata}
          ref={(node) => {
            triggerRef.current = node;
            setRef(ref, node);
          }}
          data-variant={variant}
          data-density={compact ? 'compact' : undefined}
          className={classNames(
            'env-button',
            variant === 'outlined' ? 'env-button-outlined' : 'env-button-secondary',
            'env-dropdown-trigger',
            className,
          )}
        >
          <BaseSelect.Value placeholder={placeholder} />
          <BaseSelect.Icon className="env-symbol">
            <ChevronRight />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <Theme theme={theme}>
            <BaseSelect.Positioner
              className="env-select-positioner"
              alignItemWithTrigger={false}
              side="bottom"
              align="start"
              sideOffset={getPopupOffset}
            >
              <BaseSelect.Popup
                className="env-dropdown-options"
                render={<Surface padding={compact ? 1 : 2} density={density} />}
              >
                <BaseSelect.List className="env-dropdown-list">
                  {options.map((option) => (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      disabled={option.disabled}
                      className="env-dropdown-option"
                    >
                      {compact && (
                        // A check mark shows the selected option; the slot keeps labels aligned.
                        <span className="env-dropdown-option-check" aria-hidden="true">
                          <BaseSelect.ItemIndicator className="env-symbol">
                            <Check />
                          </BaseSelect.ItemIndicator>
                        </span>
                      )}
                      <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </Theme>
        </BaseSelect.Portal>
      </FieldFrame>
    </BaseSelect.Root>
  );
});
