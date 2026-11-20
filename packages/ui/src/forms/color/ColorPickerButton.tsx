'use client';

import { cloneElement, useRef, type ComponentPropsWithRef, type ReactElement } from 'react';
import { Popover, type PopoverOpenChangeDetails } from '../../overlays/Popover.js';
import type { ControlSize } from '../../foundations/Theme.js';
import { colorPicker as colorPickerMessages } from '../../foundations/messages/colorPicker.js';
import type { PopupSide } from '../../internal/popup/PopupSurface.js';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { ColorPicker } from './ColorPicker.js';
import type { ColorPickerValueProps } from './internal/colorPickerValueProps.js';
import { ColorSwatch } from './ColorSwatch.js';
import { ColorLocale } from './internal/ColorLocale.js';
import { ColorChangeContext } from './internal/ColorChangeContext.js';
import { displayColor, formatColor, sameColor } from './internal/colorValue.js';
import { useColorFollowingValue } from './internal/useColorFollowingValue.js';
import { useFormReset } from '../../internal/field/useFormReset.js';
import '../../styles/Base.css';
import '../../styles/ColorPicker.css';

export interface ColorPickerButtonProps
  extends
    ColorPickerValueProps,
    Omit<
      ComponentPropsWithRef<'button'>,
      keyof ColorPickerValueProps | 'children' | 'type' | 'color'
    > {
  /** The button's height, as on every control; without it, its container's. */
  size?: ControlSize;
  /**
   * The side of the button the picker opens on.
   * @default 'bottom'
   */
  side?: PopupSide;
  /**
   * How the picker lines up with the button along that side.
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end';
  /** Whether the picker is open, for a picker the application controls with onOpenChange. */
  open?: boolean;
  /**
   * Whether an uncontrolled picker starts open, such as in a picture of it.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Receives the requested state, and why, as Popover's onOpenChange does: such as to close the
   * picker once a swatch is chosen.
   */
  onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
  /**
   * The element that opens the picker in place of the swatch button, such as a text color button
   * of a toolbar, an A over a bar of the color: an element, or a function that receives the color's
   * value and returns one. It takes the native props given here, the opening behavior and, unless
   * it has its own, the name after the label and the color; style it, and show the color, yourself.
   * @default a button with a swatch and the value
   */
  trigger?: ReactElement | ((color: { value: string }) => ReactElement);
}

/**
 * A compact button that shows a color as a swatch and its value, and opens a ColorPicker in a Popover: the
 * common way to choose a color in a toolbar, a row or a form. The button is named after the label
 * and the color, such as Accent color, #6750A4. className, style, ref and the other native props go
 * to the button.
 */
export function ColorPickerButton({
  label,
  value,
  defaultValue = '#000000',
  onValueChange,
  valueFormat = 'hex',
  alpha = false,
  name,
  form,
  disabled = false,
  formats,
  eyeDropper,
  copyable,
  swatches,
  swatchesFirst,
  fields,
  readOnly,
  className,
  size,
  side = 'bottom',
  align = 'start',
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  'aria-label': ownLabel,
  ...props
}: ColorPickerButtonProps) {
  const messages = useMessages('colorPicker', colorPickerMessages);
  const { color, setOwn, reset, controlled } = useColorFollowingValue(value, defaultValue, alpha);
  const inputRef = useRef<HTMLInputElement>(null);
  useFormReset(
    inputRef,
    () => {
      if (!controlled) reset();
    },
    form,
  );
  const shown = displayColor(color, valueFormat);
  const buttonName = ownLabel ?? messages.button({ label, value: shown });
  const own =
    typeof trigger === 'function' ? trigger({ value: formatColor(color, valueFormat) }) : trigger;
  const ownProps = (own?.props ?? {}) as {
    'aria-label'?: string;
    disabled?: boolean;
    className?: string;
  };
  const opener = own ? (
    cloneElement(own as ReactElement<Record<string, unknown>>, {
      ...props,
      className: classNames(ownProps.className, className) || undefined,
      disabled: disabled || ownProps.disabled,
      'aria-label': ownLabel ?? ownProps['aria-label'] ?? buttonName,
    })
  ) : (
    <button
      {...props}
      type="button"
      disabled={disabled}
      className={classNames('env-color-picker-button', className)}
      data-size={size}
      aria-label={buttonName}
    >
      <ColorSwatch color={color} aria-hidden="true" />
      <span className="env-color-picker-button-value">{shown}</span>
    </button>
  );
  return (
    <ColorLocale>
      <Popover
        aria-label={label}
        side={side}
        align={align}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        className="env-color-picker-popover"
        trigger={opener}
      >
        <ColorChangeContext
          value={(nextColor) => {
            setOwn(nextColor);
            if (!sameColor(nextColor, color)) onValueChange?.(formatColor(nextColor, valueFormat));
          }}
        >
          <ColorPicker
            formats={formats}
            eyeDropper={eyeDropper}
            copyable={copyable}
            swatches={swatches}
            swatchesFirst={swatchesFirst}
            fields={fields}
            readOnly={readOnly}
            label={label}
            visibleLabel={false}
            value={color}
            alpha={alpha}
            valueFormat={valueFormat}
            disabled={disabled}
          />
        </ColorChangeContext>
      </Popover>
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        form={form}
        value={formatColor(color, valueFormat)}
        disabled={disabled}
      />
    </ColorLocale>
  );
}
