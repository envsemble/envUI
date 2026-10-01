import { forwardRef, useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Theme, useTheme } from './Theme.js';
import { ChevronRight } from './icons/ChevronRight.js';
import { FieldFrame, useFieldMetadata, type FieldProps } from './FieldFrame.js';
import { setRef, subscribeFormReset } from './FormUtilities.js';

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
    form,
    id: suppliedId,
    className,
    ...triggerProps
  },
  ref,
) {
  const metadata = useFieldMetadata(suppliedId, hint, error, describedBy, invalid);
  const { id } = metadata;
  const theme = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? null);
  const selected = value === undefined ? uncontrolled : value;
  useEffect(
    function subscribeToFormReset() {
      const input = inputRef.current;
      const ownerForm = input?.form;
      if (!input || !ownerForm) return;
      return subscribeFormReset(ownerForm, function applyReset() {
        const resetValue = value === undefined ? (defaultValue ?? null) : value;
        if (value === undefined) setUncontrolled(resetValue);
        input.value = resetValue ?? '';
      });
    },
    [value, defaultValue, form],
  );
  function change(next: string | null) {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }
  function popupOffset() {
    const trigger = triggerRef.current;
    const view = trigger?.ownerDocument.defaultView;
    return trigger && view ? Number.parseFloat(view.getComputedStyle(trigger).columnGap) || 0 : 0;
  }
  return (
    <BaseSelect.Root<string>
      items={options}
      value={selected}
      onValueChange={change}
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
          className={['env-button', 'env-dropdown-trigger', className].filter(Boolean).join(' ')}
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
              sideOffset={popupOffset}
            >
              <BaseSelect.Popup className="env-dropdown-options">
                <BaseSelect.List className="env-dropdown-list env-connected-rows">
                  {options.map((option) => (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      disabled={option.disabled}
                      className="env-dropdown-option env-connected-row"
                    >
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
