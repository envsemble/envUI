'use client';

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

/** One option of a Select. */
export interface SelectOption {
  /** The value the select reports and a form submits when this option is chosen. */
  value: string;
  /** The option's name in the list and, once chosen, on the trigger; typing it jumps to the option. */
  label: string;
  /** Show the option but don't let people choose it; the keyboard can still highlight it. */
  disabled?: boolean;
}
export interface SelectProps
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
    >,
    FieldProps {
  /** The options of the list, in order, each with a value, a label and whether it is disabled. */
  options: readonly SelectOption[];
  /**
   * The chosen option's value in a controlled select, or null for none, which shows the
   * placeholder; update it from onValueChange.
   */
  value?: string | null;
  /**
   * The chosen option's value an uncontrolled select starts with; a native form reset returns to it.
   * Without it, nothing is chosen and the trigger shows the placeholder.
   */
  defaultValue?: string | null;
  /** Receives the value of the option people choose. */
  onValueChange?: (value: string | null) => void;
  /** Submits the chosen option's value with a form under this name, through a hidden input. */
  name?: string;
  /**
   * Require a choice before the form submits: the browser refuses the form and moves focus to the
   * trigger while nothing is chosen.
   */
  required?: boolean;
  /** What the trigger shows while nothing is chosen, such as Choose an owner. */
  placeholder?: string;
  /** A hint for the browser's autofill, such as country, set on the hidden input. */
  autoComplete?: string;
  /**
   * The trigger's Button style, to suit its surroundings: secondary, a filled pill, for the page;
   * or outlined, a bordered pill, for panes, dialogs, rows and toolbars, where a fill would blend
   * with the surface.
   * @default 'secondary'
   */
  variant?: 'secondary' | 'outlined';
  /**
   * standard, or compact for dense desktop surfaces such as toolbars: a 2 rem trigger, and the
   * compact menu's popup with short rows, where a check mark shows the chosen option.
   * @default 'standard'
   */
  density?: 'standard' | 'compact';
}

/**
 * One choice from a list that stays collapsed until opened: a Button-style trigger that shows the
 * chosen option and opens a popup list, with a label above it, a hint, an error and native form
 * participation.
 */
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
