'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import {
  Fragment,
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
import { setRef } from '../../internal/react/setRef.js';
import { useHydrated } from '../../internal/react/useHydrated.js';
import { useControllableState } from '../../internal/react/useControllableState.js';
import { useDirection } from '../../internal/provider/useDirection.js';
import { usePortalContainer } from '../../internal/provider/PortalContainerContext.js';
import { containedOpenChange } from '../../internal/popup/containedOverlays.js';
import type { OverlayOpenChangeReason } from '../../internal/popup/overlayOpenChangeReason.js';
import type { PopoverOpenChangeReason } from '../../overlays/Popover.js';
import { IconButton } from '../../actions/Button.js';
import { IconClose } from '../../icons/Close.js';
import {
  FieldFrame,
  FieldLabelContent,
  type FieldControlBoxProps,
  type FieldProps,
  type FieldSizeProps,
  type TextFieldDecorationProps,
} from '../../internal/field/FieldFrame.js';
import { PickerPopup, type PickerName } from './PickerPopup.js';
import { useFormReset } from '../../internal/field/useFormReset.js';
import { useFieldMetadata } from '../../internal/field/useFieldMetadata.js';
import { useRowControlNaming } from '../../internal/field/rowControl.js';
import { flag } from '../../internal/flag.js';
import { DecorativeIcon } from '../../internal/icon/DecorativeIcon.js';
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
  /**
   * Content at the top of the popup, above the calendar or the list, such as presets: buttons for
   * Tomorrow or Next Monday that set the value, from a field the application controls.
   */
  popupHeader?: ReactNode;
  /**
   * Content in the popup's footer, after its shortcut to the current date or time and before Clear,
   * such as a note of the time zone or another action.
   */
  popupFooter?: ReactNode;
}

export function usePickerOpen({
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  readOnly = false,
}: Pick<PickerFieldProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'readOnly'>) {
  const [shown, setShown] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  function setOpen(next: boolean, reason: PickerOpenChangeReason) {
    const unavailableFieldStaysClosed = next && (disabled || readOnly);
    if (unavailableFieldStaysClosed) return;
    setShown(next, { reason });
  }
  return [shown, setOpen] as const;
}

function PickerValue({ display, placeholder }: { display: string; placeholder: ReactNode }) {
  const hydrated = useHydrated();
  if (!display) return <span className="env-date-picker-placeholder">{placeholder}</span>;
  return (
    <span className="env-date-picker-value" suppressHydrationWarning>
      {hydrated ? display : keepServerTextUntilHydratedWithoutMismatch(display)}
    </span>
  );
}

const keepServerTextUntilHydratedWithoutMismatch = (text: string) => [text];

function ignoreChangeOfFormValueInput() {}

function PickerLabel({
  triggerId,
  labelId,
  open,
  triggerRef,
  children,
}: {
  triggerId: string;
  labelId: string;
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}) {
  const popupWasOpenAtPress = useRef(false);
  return (
    <label
      htmlFor={triggerId}
      id={labelId}
      className="env-date-picker-label"
      onPointerDown={() => {
        popupWasOpenAtPress.current = open;
      }}
      onClick={(event) => {
        const clickWouldReopenThePopupThePressClosed = popupWasOpenAtPress.current;
        if (!clickWouldReopenThePopupThePressClosed) return;
        popupWasOpenAtPress.current = false;
        event.preventDefault();
        triggerRef.current?.focus();
      }}
    >
      {children}
    </label>
  );
}

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
      readOnly={readOnly}
      tabIndex={-1}
      aria-hidden="true"
      autoComplete="off"
      onChange={ignoreChangeOfFormValueInput}
      onFocus={function moveInvalidSubmitFocusToTheField() {
        triggerRef.current?.focus();
      }}
    />
  );
}

interface PickerFieldOwnProps extends Omit<
  PickerFieldProps,
  'open' | 'defaultOpen' | 'onOpenChange'
> {
  serialized: string;
  display: string;
  icon: ReactNode;
  rootClassName: string;
  popupClassName?: string;
  popupStart: ReactNode;
  popupEnd?: ReactNode;
  initialFocus: (popup: HTMLElement | null) => HTMLElement | null;
  clearLabel: string;
  onClear: () => void;
  onFormReset: () => void;
  open: boolean;
  setOpen: (open: boolean, reason: PickerOpenChangeReason) => void;
  children: ReactNode | ((name: PickerName) => ReactNode);
}

export function PickerField({
  ref,
  serialized,
  display,
  icon,
  rootClassName,
  popupClassName,
  popupStart,
  popupEnd,
  popupHeader,
  popupFooter,
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
  const naming = useRowControlNaming({
    label,
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
  });
  const metadata = useFieldMetadata(
    suppliedId,
    description,
    error,
    naming['aria-describedby'] ?? describedBy,
    invalid,
  );
  const { id } = metadata;
  const labelId = `${id}-label`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const controlBoxRef = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [direction] = useDirection(triggerRef, open);
  const accessibleName: PickerName = {
    'aria-labelledby':
      labelledBy ?? naming['aria-labelledby'] ?? (label != null ? labelId : undefined),
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
  const [openLookUntilPopupHasClosed, setOpenLookUntilPopupHasClosed] = useState(open);
  if (open && !openLookUntilPopupHasClosed) setOpenLookUntilPopupHasClosed(true);
  const [freshContentPerOpening, setFreshContentPerOpening] = useState({ open, count: 0 });
  if (open !== freshContentPerOpening.open)
    setFreshContentPerOpening({ open, count: freshContentPerOpening.count + (open ? 1 : 0) });

  function renderControlBox(boxProps: FieldControlBoxProps) {
    return (
      <div
        {...boxProps}
        ref={controlBoxRef}
        className={`${boxProps.className} env-date-picker-control`}
        data-popup-open={flag(openLookUntilPopupHasClosed)}
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
        if (!next) setOpenLookUntilPopupHasClosed(false);
      }}
    >
      <FieldFrame
        id={id}
        label={
          label != null ? (
            <PickerLabel triggerId={id} labelId={labelId} open={open} triggerRef={triggerRef}>
              <FieldLabelContent>{label}</FieldLabelContent>
            </PickerLabel>
          ) : null
        }
        description={description}
        error={error}
        controlBox
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
          <DecorativeIcon className="env-date-picker-icon">{icon}</DecorativeIcon>
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
        anchorRef={controlBoxRef}
        popupRef={popupRef}
        triggerRef={triggerRef}
        dir={direction}
        name={accessibleName}
        initialFocus={initialFocus}
        header={popupHeader}
        start={
          <>
            {popupStart}
            {popupFooter}
          </>
        }
        end={popupEnd}
      >
        <Fragment key={freshContentPerOpening.count}>
          {typeof children === 'function' ? children(accessibleName) : children}
        </Fragment>
      </PickerPopup>
    </BasePopover.Root>
  );
}
