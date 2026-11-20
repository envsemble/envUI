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
import { IconButton } from '../../actions/Button.js';
import { Tooltip } from '../../overlays/Tooltip.js';
import { colorPicker as colorPickerMessages } from '../../foundations/messages/colorPicker.js';
import { IconColorize } from '../../icons/Colorize.js';
import * as Field from '../Field.js';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { setRef } from '../../internal/react/setRef.js';
import { ColorArea } from './internal/ColorArea.js';
import { ColorLocale } from './internal/ColorLocale.js';
import { ColorSlider } from './internal/ColorSlider.js';
import { ColorValues } from './internal/ColorValues.js';
import { SwatchList } from './internal/SwatchList.js';
import { useEyeDropper } from './internal/useEyeDropper.js';
import type { ColorPickerValueProps } from './internal/colorPickerValueProps.js';
import { ColorChangeContext } from './internal/ColorChangeContext.js';
import { useColorFollowingValue } from './internal/useColorFollowingValue.js';
import { useFormReset } from '../../internal/field/useFormReset.js';
import { fieldDescribedBy, fieldPartIds } from '../../internal/field/useFieldControl.js';
import { formatColor, sameColor, toColor, type ColorFormat } from './internal/colorValue.js';
import { flag } from '../../internal/flag.js';
import { Slot } from '../../internal/layout/Slot.js';
import '../../styles/Base.css';
import '../../styles/ColorPicker.css';

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
   * The label shows above the picker. false hides it where something else names the picker, such
   * as the popover around it: the label still names the picker for assistive technology.
   * @default true
   */
  visibleLabel?: boolean;
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
  visibleLabel = true,
  value,
  defaultValue = '#000000',
  onValueChange,
  valueFormat = 'hex',
  formats: ownFormats,
  alpha = false,
  eyeDropper = true,
  copyable = true,
  swatches,
  swatchesFirst = false,
  fields = true,
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
  const together = formats.length > 1 && ownFormats !== undefined;
  const [chosenFormat, setFormat] = useState(formats[0]);
  const format = formats.includes(chosenFormat) ? chosenFormat : formats[0];
  const { color, setOwn, reset, controlled } = useColorFollowingValue(value, defaultValue, alpha);
  const inputRef = useRef<HTMLInputElement>(null);
  const resetting = useFormReset(
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

  const swatchList = swatches && swatches.length > 0 && (
    <SwatchList
      swatches={swatches}
      value={color}
      onChange={change}
      alpha={alpha}
      disabled={inactive}
      label={messages.swatches}
    />
  );

  const ids = fieldPartIds(id);
  const describedByIds = fieldDescribedBy(id, describedBy, description, error);

  return (
    <ColorLocale>
      <div
        {...props}
        ref={(element) => setRef(ref, element)}
        id={id}
        role="group"
        aria-labelledby={visibleLabel ? ids.label : undefined}
        aria-label={visibleLabel ? undefined : label}
        aria-describedby={describedByIds}
        aria-disabled={disabled || undefined}
        className={classNames('env-color-picker', className)}
        data-disabled={flag(disabled)}
        data-readonly={flag(readOnly)}
        data-invalid={flag(error != null)}
      >
        {visibleLabel && (
          <span id={ids.label} className="env-color-picker-label">
            {label}
          </span>
        )}
        {swatchesFirst && swatchList}
        <div className="env-color-picker-controls">
          <ColorArea value={color} onChange={change} disabled={inactive} label={label} />
          <div className="env-color-picker-sliders">
            <ColorSlider channel="hue" value={color} onChange={change} disabled={inactive} />
            {alpha && (
              <ColorSlider channel="alpha" value={color} onChange={change} disabled={inactive} />
            )}
          </div>
        </div>
        {fields && (
          <ColorValues
            color={color}
            onChange={change}
            formats={formats}
            oneAtATimeFormat={format}
            onFormatChange={setFormat}
            together={together}
            alpha={alpha}
            copyable={copyable}
            eyeDropperButton={eyeDropperButton}
            disabled={disabled}
            readOnly={readOnly}
          />
        )}
        {!swatchesFirst && swatchList}
        {description != null && (
          <div id={ids.description} className="env-color-picker-description">
            <Slot className="env-color-picker-description-content">{description}</Slot>
          </div>
        )}
        {error != null && (
          <Field.Root invalid>
            <Field.Error id={ids.error} className="env-color-picker-error">
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
