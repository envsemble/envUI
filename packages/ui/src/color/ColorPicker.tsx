'use client';

import {
  useContext,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import type { Color } from '@react-stately/color';
import { CopyButton } from '../actions/CopyButton.js';
import { Button, IconButton } from '../actions/Button.js';
import * as Menu from '../navigation/Menu.js';
import { IconExpandMore } from '../icons/ExpandMore.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { colorPicker as colorPickerMessages } from '../foundations/messages/colorPicker.js';
import { IconColorize } from '../icons/Colorize.js';
import * as Field from '../forms/Field.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { setRef } from '../internal/setRef.js';
import { ColorArea } from './internal/ColorArea.js';
import { ColorFields } from './internal/ColorFields.js';
import { ColorLocale, displayColor } from './internal/ColorLocale.js';
import { ColorSlider } from './internal/ColorSlider.js';
import { SwatchList } from './internal/SwatchList.js';
import { useEyeDropper } from './internal/useEyeDropper.js';
import type { ColorPickerValueProps } from './internal/colorPickerValueProps.js';
import { ColorChangeContext } from './internal/colorChange.js';
import { useColorState, useFormResetOf } from './internal/useColorState.js';
import { formatColor, sameColor, toColor, type ColorFormat } from './internal/colorValue.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/ColorPicker.css';

export type { Color } from '@react-stately/color';
export type { ColorFormat, ColorValue } from './internal/colorValue.js';
export type { ColorPickerSwatch } from './internal/SwatchList.js';

const allFormats: readonly ColorFormat[] = ['hex', 'rgb', 'hsl'];

export interface ColorPickerProps
  extends
    ColorPickerValueProps,
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
 * A compact color picker on React Aria's color hooks: a square saturation and brightness area with
 * a vertical hue slider, and an alpha slider with `alpha`, at its side; under them, a format select,
 * the browser's eyedropper where it has one, a copy button, and fields for the chosen format, or
 * the fields of several `formats` together, each with its own copy button; and preset swatches.
 * Every part works with the keyboard; the channels and the area are named in the EnvUIProvider's
 * language.
 */
export function ColorPicker({
  ref,
  label,
  showLabel = true,
  value,
  defaultValue = '#000000',
  onValueChange,
  valueFormat = 'hex',
  formats: ownFormats,
  alpha = false,
  eyeDropper = true,
  copyable = true,
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
  const formats = ownFormats && ownFormats.length > 0 ? ownFormats : allFormats;
  // Two or more formats show together; one, or none given, one at a time.
  const together = formats.length > 1 && ownFormats !== undefined;
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
  const onColorChange = useContext(ColorChangeContext);

  function change(next: Color) {
    if (inactive || resetting.current) return;
    const normalized = alpha ? next : next.withChannelValue('alpha', 1);
    setOwn(normalized);
    onColorChange?.(normalized);
    if (!sameColor(normalized, color)) onValueChange?.(formatColor(normalized, valueFormat));
  }

  const shorts = {
    red: messages.redShort,
    green: messages.greenShort,
    blue: messages.blueShort,
    hue: messages.hueShort,
    saturation: messages.saturationShort,
    lightness: messages.lightnessShort,
    alpha: messages.alphaShort,
  };
  const fields = (each: ColorFormat) => (
    <ColorFields
      format={each}
      alpha={alpha}
      hexLabel={messages.hexField}
      shorts={shorts}
      value={color}
      onChange={change}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
  const eyeDropperButton = eyeDropper && pick && !inactive && (
    <Tooltip content={messages.eyeDropper}>
      <IconButton
        variant="ghost"
        size="sm"
        icon={<IconColorize />}
        aria-label={messages.eyeDropper}
        className="env-color-picker-eye-dropper"
        onClick={async () => {
          const picked = await pick();
          if (picked)
            change(toColor(picked, true).withChannelValue('alpha', color.getChannelValue('alpha')));
        }}
      />
    </Tooltip>
  );

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
        data-disabled={flag(disabled)}
        data-readonly={flag(readOnly)}
        data-invalid={flag(error != null)}
      >
        {showLabel && (
          <span id={`${id}-label`} className="env-color-picker-label">
            {label}
          </span>
        )}
        <div className="env-color-picker-controls">
          <ColorArea value={color} onChange={change} disabled={inactive} label={label} />
          <div className="env-color-picker-sliders">
            <ColorSlider channel="hue" value={color} onChange={change} disabled={inactive} />
            {alpha && (
              <ColorSlider channel="alpha" value={color} onChange={change} disabled={inactive} />
            )}
          </div>
        </div>
        {together ? (
          // Each format on a row of its own, named after it, its fields and its copy button in
          // columns that line up from row to row; the eyedropper ends the first row. The channels'
          // letters, and the hex value's #, say which format a row is.
          <div
            className="env-color-picker-values"
            data-formats="together"
            data-alpha={flag(alpha)}
            data-eye-dropper={flag(eyeDropperButton)}
          >
            {formats.map((each, index) => (
              <div
                key={each}
                role="group"
                aria-label={messages[each]}
                className="env-color-picker-row"
                data-format={each}
              >
                {fields(each)}
                {index === 0 && eyeDropperButton}
                {copyable && (
                  <div className="env-color-picker-copy">
                    <CopyButton
                      variant="ghost"
                      size="sm"
                      aria-label={messages.copyFormat({ format: messages[each] })}
                      value={() => displayColor(color, each)}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="env-color-picker-values" data-format={format} data-alpha={flag(alpha)}>
            {formats.length > 1 && (
              <div className="env-color-picker-format">
                <Menu.Root
                  aria-label={messages.format}
                  align="start"
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      endIcon={<IconExpandMore />}
                      disabled={disabled}
                      aria-label={messages.formatButton({ format: messages[format] })}
                    >
                      {messages[format]}
                    </Button>
                  }
                >
                  <Menu.RadioGroup
                    value={format}
                    onValueChange={(next) => setFormat(next as ColorFormat)}
                  >
                    {formats.map((each) => (
                      <Menu.RadioItem key={each} value={each}>
                        {messages[each]}
                      </Menu.RadioItem>
                    ))}
                  </Menu.RadioGroup>
                </Menu.Root>
              </div>
            )}
            {fields(format)}
            {eyeDropperButton}
            {copyable && (
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
        )}
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
          // Field's error, with its icon before the message, as under every field.
          <Field.Root invalid>
            <Field.Error id={`${id}-error`} className="env-color-picker-error">
              {error}
            </Field.Error>
          </Field.Root>
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
