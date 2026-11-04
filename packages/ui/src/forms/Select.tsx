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
import { IconChevronRight } from '../icons/ChevronRight.js';
import { IconCheck } from '../icons/Check.js';
import {
  FieldFrame,
  type FieldProps,
  type TextFieldDecorationProps,
} from './internal/FieldFrame.js';
import { PopupSurface } from '../internal/PopupSurface.js';
import {
  containedModal,
  keepsOpen,
  usePortalContainer,
} from '../internal/PortalContainerContext.js';
import { Grid } from '../foundations/Layout.js';
import { ListRow } from '../internal/ListRow.js';
import { setRef } from '../internal/setRef.js';
import { classNames } from '../internal/classNames.js';
import { flag } from '../internal/flag.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';
import '../styles/Base.css';
import '../styles/Select.css';

/** One option of a Select. */
export interface SelectItem {
  /** The value the select reports and a form submits when this option is chosen. */
  value: string;
  /** The option's name in the list and, once chosen, on the trigger; typing it jumps to the option. */
  label: string;
  /** Show the option but don't let people choose it; the keyboard can still highlight it. */
  disabled?: boolean;
}
/** What a select's onOpenChange receives beside the requested state. */
export interface SelectOpenChangeDetails {
  /** Why it asks to open or close, as Base UI says, such as trigger-press, item-press or escape-key. */
  reason: string;
}

export interface SelectProps
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
    >,
    FieldProps,
    Pick<TextFieldDecorationProps, 'showLabel'> {
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
  /** Whether the list is open, for a select the application controls with onOpenChange. */
  open?: boolean;
  /**
   * Whether the list of an uncontrolled select starts open, such as in a picture of the open list.
   * @default false
   */
  defaultOpen?: boolean;
  /** Receives the requested state, and why, each time the list asks to open or close. */
  onOpenChange?: (open: boolean, details: SelectOpenChangeDetails) => void;
  /**
   * People can read the chosen option, and a form submits it, but the list doesn't open.
   * @default false
   */
  readOnly?: boolean;
  /** Submits the chosen option's value with a form under this name, through a hidden input. */
  name?: string;
  /**
   * Require a choice before the form submits: the browser refuses the form and moves focus to the
   * trigger while nothing is chosen.
   * @default false
   */
  required?: boolean;
  /** What the trigger shows while nothing is chosen, such as Choose an owner. */
  placeholder?: string;
  /** A hint for the browser's autofill, such as country, set on the hidden input. */
  autoComplete?: string;
  /**
   * The field's look, as on every field: outline, with a thin border, at the control height; or
   * floating, an outlined field 3.5 rem tall whose label rests inside and floats into the outline,
   * for long forms on a page. A select without a visible label, such as in a toolbar, is as wide as
   * its longest option.
   * @default 'outline'
   */
  variant?: 'outline' | 'floating';
  /**
   * The field's height, as on every control: sm, md or lg in the current scale. Without it, the
   * field takes the control height of its container, md unless the container sets another. A
   * floating field has its own height. The popup's rows take the row height of the scale.
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
 * One choice from a list that stays collapsed until opened: an outlined field, as TextField is,
 * whose button shows the chosen option and opens a popup list, where a check mark shows the chosen
 * option, with its label inside, a description, an error and native form participation.
 */
export function Select({
  ref,
  items,
  value,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  readOnly = false,
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
  variant = 'outline',
  size,
  showLabel,
  form,
  id: suppliedId,
  className,
  style,
  ...triggerProps
}: SelectProps) {
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const { id } = metadata;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Whether the list last opened from the keyboard, where Base UI moves focus into it. */
  const openedByKeyboard = useRef(false);
  const portal = usePortalContainer();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? null);
  const selectedValue = value === undefined ? uncontrolledValue : value;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  // The label floats into the outline while the field holds a value or its list is open.
  const labelFloats = selectedValue != null || open;
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
  return (
    <BaseSelect.Root<string>
      items={items}
      value={selectedValue}
      onValueChange={handleValueChange}
      open={open}
      readOnly={readOnly}
      onOpenChange={(next, details) => {
        if (keepsOpen(portal, next, details, triggerRef.current)) {
          details.cancel();
          return;
        }
        if (controlledOpen === undefined) setUncontrolledOpen(next);
        onOpenChange?.(next, { reason: details.reason });
        // A key, or the click a key gives a button (detail 0), rather than the pointer, which
        // opens the list on mousedown.
        const event = details.event;
        if (next)
          openedByKeyboard.current =
            event?.type.startsWith('key') === true ||
            (event?.type === 'click' && (event as MouseEvent).detail === 0);
      }}
      onOpenChangeComplete={(open) => {
        // Base UI moves focus to the highlighted option a frame after the list opens from the
        // keyboard. On a busy page that queued focus is now and then lost, leaving focus on the
        // trigger with the list open and an option highlighted; once the list has opened, focus
        // goes where Base UI meant. A pointer open is left as Base UI leaves it.
        const trigger = triggerRef.current;
        if (!open || !openedByKeyboard.current) return;
        if (!trigger || trigger.ownerDocument.activeElement !== trigger) return;
        const options = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [];
        const option =
          Array.from(options).find((each) => each.hasAttribute('data-highlighted')) ??
          Array.from(options).find((each) => each.getAttribute('aria-selected') === 'true');
        option?.focus({ preventScroll: true });
      }}
      modal={containedModal(portal, true)}
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
        label={
          label != null ? (
            <BaseSelect.Label render={<label />} className="env-select-label">
              {label}
            </BaseSelect.Label>
          ) : null
        }
        description={description}
        error={error}
        floatingLabel
        variant={variant}
        size={size}
        showLabel={showLabel}
        className={classNames('env-select', className)}
        style={style}
        renderControlBox={(box) => (
          <div
            {...box}
            ref={controlRef}
            className={classNames(box.className, 'env-select-control')}
            data-label-floating={flag(labelFloats)}
          />
        )}
      >
        <BaseSelect.Trigger
          {...triggerProps}
          {...metadata}
          ref={(node: HTMLButtonElement | null) => {
            triggerRef.current = node;
            setRef(ref, node);
          }}
          className="env-text-field-input env-select-trigger"
        >
          <BaseSelect.Value
            className="env-select-value"
            placeholder={<span className="env-select-placeholder">{placeholder ?? ' '}</span>}
          />
          {/* The labels of every option, hidden, as generated content, which the trigger's text
              leaves out: without a visible label, the field is as wide as its longest option. */}
          <span className="env-select-sizer" aria-hidden="true">
            {items.map((item) => (
              <span key={item.value} data-label={item.label} />
            ))}
          </span>
        </BaseSelect.Trigger>
        <span className="env-text-field-end env-select-end" aria-hidden="true">
          <span className="env-icon env-select-icon">
            <IconChevronRight />
          </span>
        </span>
        <PopupSurface
          parts={popupParts}
          side="bottom"
          align="start"
          trigger={controlRef}
          anchor={controlRef}
          className="env-select-popup"
          layout={<Grid padding={1} />}
        >
          <BaseSelect.List ref={listRef} render={<Grid />} className="env-select-list">
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
                    <IconCheck />
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
