import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Theme, useTheme } from './Theme.js';
import { ChevronRight } from './icons/ChevronRight.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
  > {
  options: readonly SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  name?: string;
  required?: boolean;
  label?: ReactNode;
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
    placeholder,
    autoComplete,
    form,
    id: suppliedId,
    className,
    ...triggerProps
  },
  ref,
) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
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
      const timers = new Set<ReturnType<typeof setTimeout>>();
      function reset(event: Event) {
        const timer = setTimeout(function applyReset() {
          timers.delete(timer);
          if (event.defaultPrevented) return;
          const resetValue = value === undefined ? (defaultValue ?? null) : value;
          if (value === undefined) setUncontrolled(resetValue);
          input!.value = resetValue ?? '';
        }, 0);
        timers.add(timer);
      }
      ownerForm.addEventListener('reset', reset);
      return () => {
        ownerForm.removeEventListener('reset', reset);
        timers.forEach((timer) => clearTimeout(timer));
      };
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
    <div className="env-form-field">
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
        {label != null && <BaseSelect.Label>{label}</BaseSelect.Label>}
        <BaseSelect.Trigger
          {...triggerProps}
          ref={(node) => {
            triggerRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
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
                <BaseSelect.List className="env-dropdown-list">
                  {options.map((option) => (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      disabled={option.disabled}
                      className="env-dropdown-option"
                    >
                      <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </Theme>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
});
