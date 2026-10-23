'use client';

import { useId, useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import type { Color } from '@react-stately/color';
import { CopyButton } from '../actions/CopyButton.js';
import { IconButton } from '../actions/Button.js';
import { Select } from '../forms/Select.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { colorPicker as colorPickerMessages } from '../foundations/messages/colorPicker.js';
import { Colorize } from '../icons/Colorize.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { setRef } from '../internal/setRef.js';
import { ColorArea } from './internal/ColorArea.js';
import { ColorFields } from './internal/ColorFields.js';
import { ColorLocale, displayColor } from './internal/ColorLocale.js';
import { ColorSlider } from './internal/ColorSlider.js';
import { SwatchList, type ColorPickerSwatch } from './internal/SwatchList.js';
import { useEyeDropper } from './internal/useEyeDropper.js';
import { useColorState, useFormResetOf } from './internal/useColorState.js';
import {
  formatColor,
  sameColor,
  toColor,
  type ColorFormat,
  type ColorValue,
} from './internal/colorValue.js';

export type { Color } from '@react-stately/color';
export type { ColorFormat, ColorValue } from './internal/colorValue.js';
export type { ColorPickerSwatch } from './internal/SwatchList.js';

const allFormats: readonly ColorFormat[] = ['hex', 'rgb', 'hsl'];

/** The props ColorPicker and ColorPickerButton share: the color, its formats and the tools. */
export interface ColorPickerValueProps {
  /**
   * The color's name, such as Accent color; it names the picker, and ColorPickerButton's popover
   * and button.
   */
  label: string;
  /**
   * The color in a controlled picker: a CSS color string, such as #6750a4, rgb(103, 80, 164) or
   * hsl(256, 34%, 48%), or React Aria's Color; update it from onValueChange.
   */
  value?: ColorValue;
  /**
   * The color an uncontrolled picker starts at, and that a form reset restores.
   * @default '#000000'
   */
  defaultValue?: ColorValue;
  /**
   * Receives the color as it changes, as a string in valueFormat, such as #6750a4, and as React
   * Aria's Color, which keeps the hue of a gray and converts to any format.
   */
  onValueChange?: (value: string, color: Color) => void;
  /**
   * The format of the string onValueChange receives and a form submits: hex (#rrggbb, or #rrggbbaa
   * while translucent), rgb (rgb() or rgba()) or hsl (hsl() or hsla()).
   * @default 'hex'
   */
  valueFormat?: ColorFormat;
  /**
   * The formats people can type the color in, in the order the format select lists them; the
   * first is shown first. With one, there is no select.
   * @default ['hex', 'rgb', 'hsl']
   */
  formats?: readonly ColorFormat[];
  /**
   * Whether the color has an alpha: a slider and a field for its opacity, and a value with its
   * alpha while translucent. Without it, colors are opaque.
   * @default false
   */
  alpha?: boolean;
  /**
   * Whether to show the eyedropper, which picks a color from the screen, where the browser has one
   * (Chromium-based browsers on the desktop); elsewhere it never shows.
   * @default true
   */
  eyeDropper?: boolean;
  /**
   * Whether to show the button that copies the color, as the fields show it.
   * @default true
   */
  copy?: boolean;
  /**
   * Preset colors to choose from, under the fields: CSS color strings, React Aria's Colors, or
   * `{ color, label }` with a name, such as the colors of a brand.
   */
  swatches?: readonly ColorPickerSwatch[];
  /** Submits the color with a form under this name, as a string in valueFormat. */
  name?: string;
  /** The id of the form the color submits with, where the picker sits outside it. */
  form?: string;
  /** Whether the picker takes no input, faded. */
  disabled?: boolean;
  /** Whether people can read and copy the color, but not change it. */
  readOnly?: boolean;
}

export interface ColorPickerProps
  extends ColorPickerValueProps,
    Omit<
      ComponentPropsWithRef<'div'>,
      'children' | 'defaultValue' | 'onChange' | 'color' | 'role' | keyof ColorPickerValueProps
    > {
  /**
   * Show the label above the picker. Set false where something else names it, such as the
   * popover around it: the label still names the picker for assistive technology.
   * @default true
   */
  showLabel?: boolean;
  /** Lasting guidance under the picker, such as where the color shows. */
  description?: ReactNode;
  /** A message under the picker that says what is wrong with the color, such as too little contrast. */
  error?: ReactNode;
}

/**
 * A compact color picker on React Aria's color hooks: a saturation and brightness area, a hue
 * slider, an alpha slider with `alpha`, a format select, fields for the chosen format, a copy
 * button, the browser's eyedropper where it has one, and preset swatches. Every part works with
 * the keyboard; the channels and the area are named in the EnvUIProvider's language.
 */
export function ColorPicker({
  ref,
  label,
  showLabel = true,
  value,
  defaultValue = '#000000',
  onValueChange,
  valueFormat = 'hex',
  formats: ownFormats = allFormats,
  alpha = false,
  eyeDropper = true,
  copy = true,
  swatches,
  name,
  form,
  disabled = false,
  readOnly = false,
  description,
  error,
  id: suppliedId,
  className,
  'aria-describedby': describedBy,
  ...props
}: ColorPickerProps) {
  const messages = useMessages('colorPicker', colorPickerMessages);
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const formats = ownFormats.length > 0 ? ownFormats : allFormats;
  const [chosenFormat, setFormat] = useState(formats[0]);
  const format = formats.includes(chosenFormat) ? chosenFormat : formats[0];
  const { color, setOwn, reset, controlled } = useColorState(value, defaultValue, alpha);
  const inputRef = useRef<HTMLInputElement>(null);
  const resetting = useFormResetOf(
    inputRef,
    () => {
      if (!controlled) reset();
    },
    form,
  );
  const pick = useEyeDropper();
  const inactive = disabled || readOnly;

  function change(next: Color) {
    if (inactive || resetting.current) return;
    const normalized = alpha ? next : next.withChannelValue('alpha', 1);
    setOwn(normalized);
    if (!sameColor(normalized, color))
      onValueChange?.(formatColor(normalized, valueFormat), normalized);
  }

  const describedByIds =
    [describedBy, description != null && `${id}-description`, error != null && `${id}-error`]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <ColorLocale>
      <div
        {...props}
        ref={(element) => setRef(ref, element)}
        id={id}
        role="group"
        aria-labelledby={showLabel ? `${id}-label` : undefined}
        aria-label={showLabel ? undefined : label}
        aria-describedby={describedByIds}
        aria-disabled={disabled || undefined}
        className={classNames('env-color-picker', className)}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-invalid={error != null || undefined}
      >
        {showLabel && (
          <span id={`${id}-label`} className="env-color-picker-label">
            {label}
          </span>
        )}
        <ColorArea value={color} onChange={change} disabled={inactive} label={label} />
        <div className="env-color-picker-controls">
          {eyeDropper && pick && !inactive && (
            <Tooltip content={messages.eyeDropper}>
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Colorize />}
                aria-label={messages.eyeDropper}
                className="env-color-picker-eye-dropper"
                onClick={async () => {
                  const picked = await pick();
                  if (picked)
                    change(
                      toColor(picked, true).withChannelValue(
                        'alpha',
                        color.getChannelValue('alpha'),
                      ),
                    );
                }}
              />
            </Tooltip>
          )}
          <div className="env-color-picker-sliders">
            <ColorSlider channel="hue" value={color} onChange={change} disabled={inactive} />
            {alpha && (
              <ColorSlider channel="alpha" value={color} onChange={change} disabled={inactive} />
            )}
          </div>
        </div>
        <div
          className="env-color-picker-values"
          data-format={format}
          data-alpha={alpha || undefined}
        >
          {formats.length > 1 && (
            <div className="env-color-picker-format">
              <Select
                aria-label={messages.format}
                variant="outline"
                size="sm"
                items={formats.map((each) => ({ value: each, label: messages[each] }))}
                value={format}
                onValueChange={(next) => {
                  if (next) setFormat(next as ColorFormat);
                }}
                disabled={disabled}
              />
            </div>
          )}
          <ColorFields
            format={format}
            alpha={alpha}
            hexLabel={messages.hexField}
            value={color}
            onChange={change}
            disabled={disabled}
            readOnly={readOnly}
          />
          {copy && (
            <div className="env-color-picker-copy">
              <CopyButton
                variant="ghost"
                size="sm"
                aria-label={messages.copy}
                value={() => displayColor(color, format)}
                disabled={disabled}
              />
            </div>
          )}
        </div>
        {swatches && swatches.length > 0 && (
          <SwatchList
            swatches={swatches}
            value={color}
            onChange={change}
            alpha={alpha}
            disabled={inactive}
            label={messages.swatches}
          />
        )}
        {description != null && (
          <div id={`${id}-description`} className="env-color-picker-description">
            {description}
          </div>
        )}
        {error != null && (
          <div id={`${id}-error`} className="env-color-picker-error">
            {error}
          </div>
        )}
        <input
          ref={inputRef}
          type="hidden"
          name={name}
          form={form}
          value={formatColor(color, valueFormat)}
          disabled={disabled}
        />
      </div>
    </ColorLocale>
  );
}
