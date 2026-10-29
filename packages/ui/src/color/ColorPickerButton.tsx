'use client';

import { useRef, type ComponentPropsWithRef } from 'react';
import { Popover, type PopoverOpenChangeDetails } from '../feedback/Popover.js';
import type { ControlSize } from '../foundations/Theme.js';
import { colorPicker as colorPickerMessages } from '../foundations/messages/colorPicker.js';
import type { PopupSide } from '../internal/PopupSurface.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { ColorPicker, type ColorPickerValueProps } from './ColorPicker.js';
import { ColorSwatch } from './ColorSwatch.js';
import { ColorLocale, displayColor } from './internal/ColorLocale.js';
import { ColorChangeContext } from './internal/colorChange.js';
import { formatColor, sameColor } from './internal/colorValue.js';
import { useColorState, useFormResetOf } from './internal/useColorState.js';
import '../styles/Base.css';
import '../styles/ColorPicker.css';

export interface ColorPickerButtonProps
  extends ColorPickerValueProps,
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
  readOnly,
  className,
  size,
  side = 'bottom',
  align = 'start',
  open,
  defaultOpen = false,
  onOpenChange,
  'aria-label': ownLabel,
  ...props
}: ColorPickerButtonProps) {
  const messages = useMessages('colorPicker', colorPickerMessages);
  const { color, setOwn, reset, controlled } = useColorState(value, defaultValue, alpha);
  const inputRef = useRef<HTMLInputElement>(null);
  useFormResetOf(
    inputRef,
    () => {
      if (!controlled) reset();
    },
    form,
  );
  const shown = displayColor(color, valueFormat);
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
        trigger={
          // A compact field-like button, with the small radius of the picker's controls.
          <button
            {...props}
            type="button"
            disabled={disabled}
            className={classNames('env-color-picker-button', className)}
            data-size={size}
            aria-label={ownLabel ?? messages.button({ label, value: shown })}
          >
            <ColorSwatch color={color} aria-hidden="true" />
            <span className="env-color-picker-button-value">{shown}</span>
          </button>
        }
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
            readOnly={readOnly}
            label={label}
            showLabel={false}
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
