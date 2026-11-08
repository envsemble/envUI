'use client';

import { useRef } from 'react';
import { useColorChannelField, useColorField } from '@react-aria/color';
import {
  useColorChannelFieldState,
  useColorFieldState,
  type Color,
  type ColorChannel,
  type ColorSpace,
} from '@react-stately/color';
import { useLocale } from '@react-aria/i18n';
import type { ColorFormat } from './colorValue.js';
import '../../../styles/Base.css';
import '../../../styles/ColorPicker.css';

interface FieldProps {
  /** The color the field shows. */
  value: Color;
  /** Receives the color the field commits. */
  onChange: (color: Color) => void;
  disabled: boolean;
  readOnly: boolean;
}

/**
 * The color as six hexadecimal digits, on React Aria's useColorField: typing commits on Enter and
 * as focus leaves, and the arrow keys step the value. It keeps the color's alpha.
 */
function HexField({ value, onChange, disabled, readOnly, label }: FieldProps & { label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const state = useColorFieldState({
    value,
    onChange: (next) => {
      if (next) onChange(next.withChannelValue('alpha', value.getChannelValue('alpha')));
    },
    isDisabled: disabled,
    isReadOnly: readOnly,
  });
  const { inputProps } = useColorField(
    { 'aria-label': label, isDisabled: disabled, isReadOnly: readOnly },
    state,
    ref,
  );
  return (
    <label className="env-color-picker-field" data-channel="hex">
      <input {...inputProps} ref={ref} className="env-color-picker-input" />
    </label>
  );
}

/**
 * One channel of the color as a number, on React Aria's useColorChannelField, named after the
 * channel, such as Red or Alpha: typing commits on Enter and as focus leaves, and the arrow keys
 * step it.
 */
function ChannelField({
  value,
  onChange,
  disabled,
  readOnly,
  channel,
  colorSpace,
  short,
}: FieldProps & { channel: ColorChannel; colorSpace: ColorSpace; short: string }) {
  const { locale } = useLocale();
  const ref = useRef<HTMLInputElement>(null);
  const state = useColorChannelFieldState({
    value,
    onChange: (next) => {
      if (next) onChange(next);
    },
    channel,
    colorSpace,
    locale,
    isDisabled: disabled,
    isReadOnly: readOnly,
  });
  const { inputProps } = useColorChannelField(
    { channel, colorSpace, isDisabled: disabled, isReadOnly: readOnly },
    state,
    ref,
  );
  // The channel's letter, such as R, shows which number is which; the input is named in full.
  return (
    <label className="env-color-picker-field" data-channel={channel}>
      <span className="env-color-picker-field-label" aria-hidden="true">
        {short}
      </span>
      <input {...inputProps} ref={ref} className="env-color-picker-input" />
    </label>
  );
}

const channels = {
  rgb: ['red', 'green', 'blue'],
  hsl: ['hue', 'saturation', 'lightness'],
} as const;

export interface ColorFieldsProps extends FieldProps {
  /** The format the fields edit. */
  format: ColorFormat;
  /** Whether an alpha field follows. */
  alpha: boolean;
  /** Names the hexadecimal field. */
  hexLabel: string;
  /** Each channel's letter, shown beside its number, such as R for red. */
  shorts: Record<'red' | 'green' | 'blue' | 'hue' | 'saturation' | 'lightness' | 'alpha', string>;
}

/**
 * The fields of a format, quiet until hovered or focused: one hexadecimal field, or a field per
 * channel with its letter, then alpha with A.
 */
export function ColorFields({ format, alpha, hexLabel, shorts, ...field }: ColorFieldsProps) {
  return (
    <div className="env-color-picker-fields">
      {format === 'hex' ? (
        <HexField {...field} label={hexLabel} />
      ) : (
        channels[format].map((channel) => (
          <ChannelField
            key={channel}
            {...field}
            channel={channel}
            colorSpace={format}
            short={shorts[channel]}
          />
        ))
      )}
      {alpha && (
        <ChannelField
          {...field}
          channel="alpha"
          colorSpace={format === 'hsl' ? 'hsl' : 'rgb'}
          short={shorts.alpha}
        />
      )}
    </div>
  );
}
