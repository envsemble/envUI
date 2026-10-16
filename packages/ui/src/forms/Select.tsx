'use client';

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type CSSProperties,
  type Ref,
} from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import { type ControlSize } from '../foundations/Theme.js';
import { Button } from '../actions/Button.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { Check } from '../icons/Check.js';
import { FieldFrame, type FieldProps } from './internal/FieldFrame.js';
import { PopupSurface } from '../internal/PopupSurface.js';
import { ListRow } from '../internal/ListRow.js';
import { setRef } from '../internal/setRef.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

/** One option of a Select. */
export interface SelectItem {
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
  /** The trigger, the button that shows the chosen option and opens the list. */
  ref?: Ref<HTMLButtonElement>;
  /** The field's class, on its root element, beside env-field and env-select. */
  className?: string;
  /** Styles of the field's root element. */
  style?: CSSProperties;
  /** The options of the list, in order, each with a value, a label and whether it is disabled. */
  items: readonly SelectItem[];
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
   * The trigger's Button variant, to suit its surroundings: secondary, a filled pill, for the page;
   * or outline, a bordered pill, for panes, dialogs, rows and toolbars, where a fill would blend
   * with the surface.
   * @default 'secondary'
   */
  variant?: 'secondary' | 'outline';
  /**
   * The trigger's height, as on every control: sm, md or lg in the current scale. Without it, the
   * trigger takes the control height of its container, md unless the container sets another. The
   * popup's rows take the row height of the scale.
   */
  size?: ControlSize;
}

/** Select's positioner, which opens the list below the trigger rather than over it. */
function SelectPositioner(props: ComponentProps<typeof BaseSelect.Positioner>) {
  return <BaseSelect.Positioner {...props} alignItemWithTrigger={false} />;
}

const popupParts = {
  Portal: BaseSelect.Portal,
  Positioner: SelectPositioner,
  Popup: BaseSelect.Popup,
};

/**
 * One choice from a list that stays collapsed until opened: a Button trigger that shows the chosen
 * option and opens a popup list, where a check mark shows the chosen option, with a label above it,
 * a description, an error and native form participation.
 */
export function Select({
  ref,
  items,
  value,
  defaultValue,
  onValueChange,
  name,
  required,
  disabled,
  label,
  description,
  error,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  placeholder,
  autoComplete,
  variant = 'secondary',
  size,
  form,
  id: suppliedId,
  className,
  style,
  ...triggerProps
}: SelectProps) {
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const { id } = metadata;
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
      items={items}
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
        description={description}
        error={error}
        className="env-select"
        style={style}
      >
        <BaseSelect.Trigger
          {...triggerProps}
          {...metadata}
          ref={(node: HTMLButtonElement | null) => {
            triggerRef.current = node;
            setRef(ref, node);
          }}
          className="env-select-trigger"
          render={
            variant === 'outline' ? (
              <Button variant="outline" size={size} />
            ) : (
              <Button variant="secondary" size={size} />
            )
          }
        >
          <BaseSelect.Value placeholder={placeholder} />
          <BaseSelect.Icon className="env-icon env-select-icon">
            <ChevronRight />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <PopupSurface
          parts={popupParts}
          side="bottom"
          align="start"
          sideOffset={getPopupOffset}
          trigger={triggerRef}
          className="env-select-popup"
        >
          <BaseSelect.List className="env-select-list">
            {items.map((item) => (
              <ListRow
                key={item.value}
                render={
                  <BaseSelect.Item value={item.value} label={item.label} disabled={item.disabled} />
                }
                className="env-select-item"
                // A check mark shows the selected option; the slot keeps the labels aligned.
                indicator={
                  <BaseSelect.ItemIndicator className="env-icon env-select-item-indicator">
                    <Check />
                  </BaseSelect.ItemIndicator>
                }
                label={<BaseSelect.ItemText>{item.label}</BaseSelect.ItemText>}
              />
            ))}
          </BaseSelect.List>
        </PopupSurface>
      </FieldFrame>
    </BaseSelect.Root>
  );
}
