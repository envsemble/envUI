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
import { mergeRefs } from '../../internal/react/setRef.js';
import { useHydrated } from '../../internal/react/useHydrated.js';
import { useDirection } from '../../internal/provider/useDirection.js';
import {
  containedOpenChange,
  usePortalContainer,
} from '../../internal/popup/PortalContainerContext.js';
import { Button, IconButton } from '../../actions/Button.js';
import { IconClose } from '../../icons/Close.js';
import {
  FieldFrame,
  FieldLabelContent,
  type FieldControlBoxProps,
} from '../../internal/field/FieldFrame.js';
import {
  type FieldProps,
  type FieldSizeProps,
  type FieldDecorationProps,
} from '../../internal/field/fieldProps.js';
import { PickerPopup, type PickerName } from './PickerPopup.js';
import { useFormReset } from '../../internal/field/useFormReset.js';
import { useFieldControl } from '../../internal/field/useFieldControl.js';
import { flag } from '../../internal/flag.js';
import { classNames } from '../../internal/classNames.js';
import type { Picker, PickerOpenChangeDetails, PickerOpenChangeReason } from './usePicker.js';
import '../../styles/Base.css';
import '../../styles/DatePicker.css';

export interface PickerFieldProps
  extends
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
    >,
    FieldProps,
    FieldSizeProps,
    Pick<FieldDecorationProps, 'visibleLabel'> {
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
  /**
   * The value can be read and focused but not changed.
   * @default false
   */
  readOnly?: boolean;
  /** Shown while the field is empty and its label floats or is hidden. */
  placeholder?: string;
  /**
   * A clear button in the field and in the popup removes the value.
   * @default false
   */
  clearable?: boolean;
  /** Whether the popup is open; with `onOpenChange` it controls it. */
  open?: boolean;
  /**
   * Whether an uncontrolled popup starts open; closed by default.
   * @default false
   */
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
  picker: Picker;
  serialized: string;
  display: string;
  icon: ReactNode;
  rootClassName: string;
  popupClassName?: string;
  initialFocus: (popup: HTMLElement | null) => HTMLElement | null;
  shortcut: { label: ReactNode; available: boolean; onPress: () => void };
  clearLabel: string;
  children: ReactNode | ((name: PickerName) => ReactNode);
}

export function PickerField({
  ref,
  picker,
  serialized,
  display,
  icon,
  rootClassName,
  popupClassName,
  popupHeader,
  popupFooter,
  initialFocus,
  shortcut,
  clearLabel,
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
  const { ids, naming, metadata } = useFieldControl({
    id: suppliedId,
    label,
    description,
    error,
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
  });
  const { id } = metadata;
  const labelId = ids.label;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const controlBoxRef = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const { open } = picker;
  const [direction] = useDirection(triggerRef, open);
  const accessibleName: PickerName = {
    'aria-labelledby':
      labelledBy ?? naming['aria-labelledby'] ?? (label != null ? labelId : undefined),
    'aria-label': labelledBy == null && label == null ? ariaLabel : undefined,
  };

  useFormReset(nativeRef, picker.reset, form);

  function setOpen(next: boolean, reason: PickerOpenChangeReason) {
    const unavailableFieldStaysClosed = next && (disabled || readOnly);
    if (unavailableFieldStaysClosed) return;
    picker.setOpen(next, reason);
  }

  function clear() {
    picker.change(null, serialized);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || readOnly) return;
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !open) {
      event.preventDefault();
      setOpen(true, 'list-navigation');
    } else if (clearable && serialized && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      clear();
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
        className={classNames(rootClassName, className)}
        style={style}
        renderControlBox={renderControlBox}
      >
        <BasePopover.Trigger
          {...triggerProps}
          ref={mergeRefs(triggerRef, ref)}
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
                clear();
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
        anchorRef={controlBoxRef}
        popupRef={popupRef}
        triggerRef={triggerRef}
        dir={direction}
        name={accessibleName}
        initialFocus={initialFocus}
        header={popupHeader}
        start={
          <>
            <Button
              variant="text"
              aria-disabled={!shortcut.available || undefined}
              onClick={() => {
                if (shortcut.available) shortcut.onPress();
              }}
            >
              {shortcut.label}
            </Button>
            {popupFooter}
          </>
        }
        end={
          clearable &&
          serialized && (
            <Button
              variant="text"
              onClick={() => {
                clear();
                setOpen(false, 'clear-press');
              }}
            >
              {clearLabel}
            </Button>
          )
        }
      >
        <Fragment key={freshContentPerOpening.count}>
          {typeof children === 'function' ? children(accessibleName) : children}
        </Fragment>
      </PickerPopup>
    </BasePopover.Root>
  );
}
