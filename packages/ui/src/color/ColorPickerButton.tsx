'use client';

import { useRef, type CSSProperties } from 'react';
import { Popover } from '../feedback/Popover.js';
import type { ControlSize } from '../foundations/Theme.js';
import { colorPicker as colorPickerMessages } from '../foundations/messages/colorPicker.js';
import type { PopupSide } from '../internal/PopupSurface.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { ColorPicker, type ColorPickerValueProps } from './ColorPicker.js';
import { ColorSwatch } from './ColorSwatch.js';
import { ColorLocale, displayColor } from './internal/ColorLocale.js';
import { formatColor, sameColor } from './internal/colorValue.js';
import { useColorState, useFormResetOf } from './internal/useColorState.js';

export interface ColorPickerButtonProps extends ColorPickerValueProps {
  /** The button's class, beside env-color-picker-button. */
  className?: string;
  /** Styles of the button. */
  style?: CSSProperties;
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
  /**
   * Whether the picker starts open, such as in a picture of it.
   * @default false
   */
  defaultOpen?: boolean;
}

/**
 * A compact button that shows a color as a swatch and its value, and opens a ColorPicker in a Popover: the
 * common way to choose a color in a toolbar, a row or a form. The button is named after the label
 * and the color, such as Accent color, #6750A4.
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
  className,
  style,
  size,
  side = 'bottom',
  align = 'start',
  defaultOpen = false,
  ...picker
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
        defaultOpen={defaultOpen}
        className="env-color-picker-popover"
        trigger={
          // A compact field-like button, with the small radius of the picker's controls.
          <button
            type="button"
            disabled={disabled}
            className={classNames('env-color-picker-button', className)}
            data-size={size}
            style={style}
            aria-label={messages.button({ label, value: shown })}
          >
            <ColorSwatch color={color} aria-hidden="true" />
            <span className="env-color-picker-button-value">{shown}</span>
          </button>
        }
      >
        <ColorPicker
          {...picker}
          label={label}
          showLabel={false}
          value={color}
          alpha={alpha}
          valueFormat={valueFormat}
          disabled={disabled}
          onValueChange={(next, nextColor) => {
            setOwn(nextColor);
            if (!sameColor(nextColor, color)) onValueChange?.(next, nextColor);
          }}
        />
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
