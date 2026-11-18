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
  value: Color;
  onChange: (color: Color) => void;
  disabled: boolean;
  readOnly: boolean;
}

const withAlphaOf = (kept: Color, next: Color) =>
  next.withChannelValue('alpha', kept.getChannelValue('alpha'));

function HexField({ value, onChange, disabled, readOnly, label }: FieldProps & { label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const state = useColorFieldState({
    value,
    onChange: (next) => {
      if (next) onChange(withAlphaOf(value, next));
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

function ChannelField({
  value,
  onChange,
  disabled,
  readOnly,
  channel,
  colorSpace,
  channelLetter,
}: FieldProps & { channel: ColorChannel; colorSpace: ColorSpace; channelLetter: string }) {
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
  return (
    <label className="env-color-picker-field" data-channel={channel}>
      <span className="env-color-picker-field-label" aria-hidden="true">
        {channelLetter}
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
  format: ColorFormat;
  alpha: boolean;
  hexLabel: string;
  channelLetters: Record<
    'red' | 'green' | 'blue' | 'hue' | 'saturation' | 'lightness' | 'alpha',
    string
  >;
}

export function ColorFields({
  format,
  alpha,
  hexLabel,
  channelLetters,
  ...field
}: ColorFieldsProps) {
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
            channelLetter={channelLetters[channel]}
          />
        ))
      )}
      {alpha && (
        <ChannelField
          {...field}
          channel="alpha"
          colorSpace={format === 'hsl' ? 'hsl' : 'rgb'}
          channelLetter={channelLetters.alpha}
        />
      )}
    </div>
  );
}
