'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { setRef } from '../../internal/setRef.js';
import { useHydrated } from '../../internal/useHydrated.js';
import { useDirection } from '../../internal/useDirection.js';
import { keepsOpen, usePortalContainer } from '../../internal/PortalContainerContext.js';
import { type ControlSize } from '../../foundations/Theme.js';
import { IconButton } from '../../actions/Button.js';
import { Close } from '../../icons/Close.js';
import { FieldFrame, type FieldControlBoxProps, type FieldProps } from './FieldFrame.js';
import { PickerPopup, type PickerName } from './PickerPopup.js';
import { subscribeFormReset } from './subscribeFormReset.js';
import { useFieldMetadata } from './useFieldMetadata.js';
import { flag } from '../../internal/flag.js';
import '../../styles/Base.css';
import '../../styles/DatePicker.css';

/** The props every picker field shares with DatePicker: its frame, form value and open state. */
export interface PickerFieldProps
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
    >,
    FieldProps {
  /** The field's button, which shows the value and opens the popup. */
  ref?: Ref<HTMLButtonElement>;
  /** The field's class, on its root element. */
  className?: string;
  /** Styles of the field's root element. */
  style?: CSSProperties;
  /** The name the value is submitted under with a form. */
  name?: string;
  /** A value is needed: an empty field keeps its form from submitting and takes focus. */
  required?: boolean;
  /** The value can be read and focused but not changed. */
  readOnly?: boolean;
  /** Shown while the field is empty and its label floats or is hidden. */
  placeholder?: string;
  /**
   * The field's look, as TextField's: outline, at the control height, or floating, 3.5 rem tall
   * with room for its label, for long forms on a page.
   * @default 'outline'
   */
  variant?: 'outline' | 'floating';
  /**
   * The field's height, as on every control: sm, md or lg in the current scale. Without it, the
   * field takes the control height of its container, md unless the container sets another.
   */
  size?: ControlSize;
  /**
   * Show the label inside the field, where it floats into the outline while the field has a value,
   * focus or its popup open. Set false for a field whose purpose is clear without it.
   * @default true
   */
  showLabel?: boolean;
  /** A clear button in the field and in the popup removes the value. */
  clearable?: boolean;
  /** Whether the popup is open; with `onOpenChange` it controls it. */
  open?: boolean;
  /** Whether an uncontrolled popup starts open; closed by default. */
  defaultOpen?: boolean;
  /** Called with the new state when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/** The open state of a picker's popup, controlled or not; a disabled or read-only field stays closed. */
export function usePickerOpen({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  readOnly = false,
}: Pick<PickerFieldProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'readOnly'>) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  function setOpen(next: boolean) {
    if (next && (disabled || readOnly)) return;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }
  return [open, setOpen] as const;
}

function ignoreChange() {
  // The visually hidden input only carries the value for native forms.
}

/**
 * The field of DatePicker, TimePicker and MonthPicker: the shared text field's frame around a
 * combobox button that shows the value in the reader's locale, with a clear button and an icon at
 * its end, a hidden input that carries the value for native forms, and the card it opens,
 * PickerPopup. The owner holds the value and the open state, and renders the card's body and its
 * footer's actions.
 */
export function PickerField({
  ref,
  serialized,
  display,
  icon,
  rootClassName,
  popupClassName,
  popupStart,
  popupEnd,
  initialFocus,
  clearLabel,
  onClear,
  onFormReset,
  open,
  setOpen,
  name,
  form,
  required = false,
  disabled = false,
  readOnly = false,
  placeholder,
  variant = 'outline',
  size,
  showLabel,
  clearable = false,
  label,
  description,
  error,
  id: suppliedId,
  className,
  style,
  children,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  onKeyDown,
  ...triggerProps
}: Omit<PickerFieldProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
  /** The value as the form submits it; empty for none. */
  serialized: string;
  /** The value as the field shows it. */
  display: string;
  /** The icon at the field's end. */
  icon: ReactNode;
  /** The owner's classes on the root, beside env-field. */
  rootClassName: string;
  /** The owner's class on the popup, beside env-picker-popup and env-date-picker-popup. */
  popupClassName?: string;
  /** The action at the start of the popup's footer, such as Today. */
  popupStart: ReactNode;
  /** The actions at the end of the popup's footer, such as Clear. */
  popupEnd?: ReactNode;
  /** The element focus moves to as the popup opens, from the popup. */
  initialFocus: (popup: HTMLElement | null) => HTMLElement | null;
  /** The clear button's name. */
  clearLabel: string;
  /** Removes the value. */
  onClear: () => void;
  /** Restores the value a form reset gives an uncontrolled field. */
  onFormReset: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The popup's body, or a function of the name the field and popup share, for its parts. */
  children: ReactNode | ((name: PickerName) => ReactNode);
}) {
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const { id } = metadata;
  const labelId = `${id}-label`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The control box, the field's visible box, which the popup opens under.
  const controlRef = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  // Whether the popup was open when a press on the label began, which closes it.
  const labelPressOpen = useRef(false);
  const resetRef = useRef(onFormReset);
  resetRef.current = onFormReset;
  // Read as the popup opens, which takes the field's direction into its portal.
  const [direction] = useDirection(triggerRef, open);
  const hydrated = useHydrated();
  // The field and its popup take the application's own aria-labelledby, else the label, else the
  // aria-label.
  const accessibleName: PickerName = {
    'aria-labelledby': labelledBy ?? (label != null ? labelId : undefined),
    'aria-label': labelledBy == null && label == null ? ariaLabel : undefined,
  };

  useEffect(
    function subscribeToFormReset() {
      const input = nativeRef.current;
      const ownerForm = input?.form;
      if (!input || !ownerForm) return;
      return subscribeFormReset(ownerForm, () => resetRef.current());
    },
    [form],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || readOnly) return;
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !open) {
      event.preventDefault();
      setOpen(true);
    } else if (clearable && serialized && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      onClear();
    }
  }

  const portal = usePortalContainer();
  const showClear = clearable && Boolean(serialized) && !disabled && !readOnly;
  const labelFloats = Boolean(serialized) || open;

  function renderControlBox(boxProps: FieldControlBoxProps) {
    return (
      <div
        {...boxProps}
        ref={controlRef}
        className={`${boxProps.className} env-date-picker-control`}
        data-label-floating={flag(labelFloats)}
        data-action-count={showClear ? '2' : '1'}
      />
    );
  }

  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(next, details) => {
        if (keepsOpen(portal, next, details)) details.cancel();
        else setOpen(next);
      }}
    >
      <FieldFrame
        id={id}
        label={
          label != null ? (
            <label
              htmlFor={id}
              id={labelId}
              className="env-date-picker-label"
              onPointerDown={() => {
                labelPressOpen.current = open;
              }}
              onClick={(event) => {
                // A press on the label closes the open popup, as a press outside it does; the
                // click that follows would open it again, as it opens a closed one.
                if (!labelPressOpen.current) return;
                labelPressOpen.current = false;
                event.preventDefault();
                triggerRef.current?.focus();
              }}
            >
              {label}
            </label>
          ) : null
        }
        description={description}
        error={error}
        floatingLabel
        variant={variant}
        size={size}
        showLabel={showLabel}
        className={className ? `${rootClassName} ${className}` : rootClassName}
        style={style}
        renderControlBox={renderControlBox}
      >
        <BasePopover.Trigger
          {...triggerProps}
          ref={(node: HTMLButtonElement | null) => {
            triggerRef.current = node;
            setRef(ref, node);
          }}
          id={id}
          role="combobox"
          {...accessibleName}
          aria-describedby={metadata['aria-describedby']}
          aria-invalid={metadata['aria-invalid']}
          aria-required={required || undefined}
          aria-readonly={readOnly || undefined}
          disabled={disabled}
          className="env-text-field-input env-date-picker-trigger"
          onKeyDown={handleKeyDown}
        >
          {display ? (
            // As in RelativeTime: should the browser format the hydrated value differently from
            // the server, the server's text stays until hydration ends, then the browser's
            // replaces it, without a mismatch error.
            <span className="env-date-picker-value" suppressHydrationWarning>
              {hydrated ? display : [display]}
            </span>
          ) : (
            <span className="env-date-picker-placeholder">{placeholder}</span>
          )}
        </BasePopover.Trigger>
        <span className="env-text-field-end env-date-picker-end">
          {showClear && (
            <IconButton
              variant="ghost"
              icon={<Close />}
              aria-label={clearLabel}
              title={clearLabel}
              className="env-date-picker-clear"
              onClick={() => {
                onClear();
                triggerRef.current?.focus();
              }}
            />
          )}
          <span className="env-icon env-date-picker-icon" aria-hidden="true">
            {icon}
          </span>
        </span>
        <input
          ref={nativeRef}
          className="env-date-picker-native"
          name={name}
          form={form}
          value={serialized}
          required={required}
          disabled={disabled}
          // Like a read-only input, a read-only field is not validated, so an empty required one
          // never keeps its form from submitting.
          readOnly={readOnly}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          onChange={ignoreChange}
          // The browser focuses an invalid required field on submit; the field takes it instead.
          onFocus={() => triggerRef.current?.focus()}
        />
      </FieldFrame>
      <PickerPopup
        className={popupClassName}
        anchorRef={controlRef}
        popupRef={popupRef}
        // The portal leaves the field's text direction behind; the popup keeps it.
        dir={direction}
        name={accessibleName}
        initialFocus={initialFocus}
        start={popupStart}
        end={popupEnd}
      >
        {typeof children === 'function' ? children(accessibleName) : children}
      </PickerPopup>
    </BasePopover.Root>
  );
}
