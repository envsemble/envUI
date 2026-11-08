'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import {
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithRef,
  type RefObject,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { setRef } from '../../internal/setRef.js';
import { useHydrated } from '../../internal/useHydrated.js';
import { useOpenState } from '../../internal/useOpenState.js';
import { useDirection } from '../../internal/useDirection.js';
import { containedOpenChange, usePortalContainer } from '../../internal/PortalContainerContext.js';
import type { OverlayOpenChangeReason } from '../../internal/overlayOpenChangeReason.js';
import type { PopoverOpenChangeReason } from '../../feedback/Popover.js';
import { IconButton } from '../../actions/Button.js';
import { IconClose } from '../../icons/Close.js';
import {
  FieldFrame,
  type FieldControlBoxProps,
  type FieldProps,
  type FieldSizeProps,
  type TextFieldDecorationProps,
} from './FieldFrame.js';
import { PickerPopup, type PickerName } from './PickerPopup.js';
import { useFormReset } from './useFormReset.js';
import { useFieldMetadata } from './useFieldMetadata.js';
import { flag } from '../../internal/flag.js';
import '../../styles/Base.css';
import '../../styles/DatePicker.css';

/**
 * Why a date, time or month picker's popup asks to open or close: a popover's reasons, such as
 * trigger-press, outside-press or escape-key; list-navigation for the arrow keys on the field;
 * item-press for a chosen value, such as a day, a month, Today or Now; or clear-press for the
 * clear button.
 */
export type PickerOpenChangeReason = Extract<
  OverlayOpenChangeReason,
  PopoverOpenChangeReason | 'list-navigation' | 'item-press' | 'clear-press'
>;

/** What a date, time or month picker's onOpenChange receives beside the requested state. */
export interface PickerOpenChangeDetails {
  /** Why the popup asks to open or close. */
  reason: PickerOpenChangeReason;
}

/** The props every picker field shares with DatePicker: its frame, form value and open state. */
export interface PickerFieldProps
  extends
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
    >,
    FieldProps,
    FieldSizeProps,
    Pick<TextFieldDecorationProps, 'visibleLabel'> {
  /** The field's button, which shows the value and opens the popup. */
  ref?: Ref<HTMLButtonElement>;
  /** The field's class, on its root element. */
  className?: string;
  /** Styles of the field's root element. */
  style?: CSSProperties;
  /** The name the value is submitted under with a form. */
  name?: string;
  /**
   * A value is needed: an empty field keeps its form from submitting and takes focus.
   * @default false
   */
  required?: boolean;
  /** The value can be read and focused but not changed. */
  readOnly?: boolean;
  /** Shown while the field is empty and its label floats or is hidden. */
  placeholder?: string;
  /** A clear button in the field and in the popup removes the value. */
  clearable?: boolean;
  /** Whether the popup is open; with `onOpenChange` it controls it. */
  open?: boolean;
  /** Whether an uncontrolled popup starts open; closed by default. */
  defaultOpen?: boolean;
  /** Called with the new state, and why, when the popup opens or closes. */
  onOpenChange?: (open: boolean, details: PickerOpenChangeDetails) => void;
}

/** The open state of a picker's popup, controlled or not; a disabled or read-only field stays closed. */
export function usePickerOpen({
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
  readOnly = false,
}: Pick<PickerFieldProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'readOnly'>) {
  const [shown, setShown] = useOpenState({ open, defaultOpen, onOpenChange });
  function setOpen(next: boolean, reason: PickerOpenChangeReason) {
    if (next && (disabled || readOnly)) return;
    setShown(next, { reason });
  }
  return [shown, setOpen] as const;
}

/** The value a picker field shows, or its placeholder while it has none. */
function PickerValue({ display, placeholder }: { display: string; placeholder: ReactNode }) {
  const hydrated = useHydrated();
  if (!display) return <span className="env-date-picker-placeholder">{placeholder}</span>;
  // As in RelativeTime: should the browser format the hydrated value differently from the server,
  // the server's text stays until hydration ends, then the browser's replaces it, without a
  // mismatch error.
  return (
    <span className="env-date-picker-value" suppressHydrationWarning>
      {hydrated ? display : [display]}
    </span>
  );
}

function ignoreChange() {
  // The visually hidden input only carries the value for native forms.
}

/**
 * A picker field's label. A press on it closes the open popup, as a press outside it does; the
 * click that follows would open it again, as it opens a closed one.
 */
function PickerLabel({
  id,
  labelId,
  open,
  triggerRef,
  children,
}: {
  /** The trigger's id, which the label is for. */
  id: string;
  labelId: string;
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}) {
  // Whether the popup was open when the press began.
  const pressOpen = useRef(false);
  return (
    <label
      htmlFor={id}
      id={labelId}
      className="env-date-picker-label"
      onPointerDown={() => {
        pressOpen.current = open;
      }}
      onClick={(event) => {
        if (!pressOpen.current) return;
        pressOpen.current = false;
        event.preventDefault();
        triggerRef.current?.focus();
      }}
    >
      {children}
    </label>
  );
}

/** The visually hidden input that carries a picker field's value for native forms. */
function PickerNativeInput({
  ref,
  triggerRef,
  readOnly,
  ...inputProps
}: Pick<
  ComponentPropsWithRef<'input'>,
  'ref' | 'name' | 'form' | 'value' | 'required' | 'disabled' | 'readOnly'
> & { triggerRef: RefObject<HTMLButtonElement | null> }) {
  return (
    <input
      {...inputProps}
      ref={ref}
      className="env-date-picker-native"
      // Like a read-only input, a read-only field is not validated, so an empty required one never
      // keeps its form from submitting.
      readOnly={readOnly}
      tabIndex={-1}
      aria-hidden="true"
      autoComplete="off"
      onChange={ignoreChange}
      // The browser focuses an invalid required field on submit; the field takes it instead.
      onFocus={() => triggerRef.current?.focus()}
    />
  );
}

/** What PickerField takes from its owner beside the field's own props. */
interface PickerFieldOwnProps extends Omit<
  PickerFieldProps,
  'open' | 'defaultOpen' | 'onOpenChange'
> {
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
  setOpen: (open: boolean, reason: PickerOpenChangeReason) => void;
  /** The popup's body, or a function of the name the field and popup share, for its parts. */
  children: ReactNode | ((name: PickerName) => ReactNode);
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
  size,
  visibleLabel,
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
}: PickerFieldOwnProps) {
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const { id } = metadata;
  const labelId = `${id}-label`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The control box, the field's visible box, which the popup opens under.
  const controlRef = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  // Read as the popup opens, which takes the field's direction into its portal.
  const [direction] = useDirection(triggerRef, open);
  // The field and its popup take the application's own aria-labelledby, else the label, else the
  // aria-label.
  const accessibleName: PickerName = {
    'aria-labelledby': labelledBy ?? (label != null ? labelId : undefined),
    'aria-label': labelledBy == null && label == null ? ariaLabel : undefined,
  };

  useFormReset(nativeRef, onFormReset, form);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || readOnly) return;
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !open) {
      event.preventDefault();
      setOpen(true, 'list-navigation');
    } else if (clearable && serialized && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      onClear();
    }
  }

  const portal = usePortalContainer();
  const showClear = clearable && Boolean(serialized) && !disabled && !readOnly;
  // The field keeps its open look, its frame and its floated label, until the popup has closed, as
  // focus comes back to it, rather than settling while the popup fades and rising again.
  const [popupShown, setPopupShown] = useState(open);
  if (open && !popupShown) setPopupShown(true);
  const labelFloats = Boolean(serialized) || popupShown;

  function renderControlBox(boxProps: FieldControlBoxProps) {
    return (
      <div
        {...boxProps}
        ref={controlRef}
        className={`${boxProps.className} env-date-picker-control`}
        data-label-floating={flag(labelFloats)}
        data-popup-open={flag(popupShown)}
        data-action-count={showClear ? '2' : '1'}
      />
    );
  }

  return (
    <BasePopover.Root
      open={open}
      onOpenChange={containedOpenChange(portal, triggerRef, (next, details) =>
        setOpen(next, details.reason),
      )}
      onOpenChangeComplete={(next) => {
        if (!next) setPopupShown(false);
      }}
    >
      <FieldFrame
        id={id}
        label={
          label != null ? (
            <PickerLabel id={id} labelId={labelId} open={open} triggerRef={triggerRef}>
              {label}
            </PickerLabel>
          ) : null
        }
        description={description}
        error={error}
        floatingLabel
        size={size}
        visibleLabel={visibleLabel}
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
          <PickerValue display={display} placeholder={placeholder} />
        </BasePopover.Trigger>
        <span className="env-text-field-end env-date-picker-end">
          {showClear && (
            <IconButton
              variant="ghost"
              icon={<IconClose />}
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
        <PickerNativeInput
          ref={nativeRef}
          name={name}
          form={form}
          value={serialized}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          triggerRef={triggerRef}
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
