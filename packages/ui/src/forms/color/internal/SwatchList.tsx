'use client';

import { useState } from 'react';
import { useLocale } from '@react-aria/i18n';
import type { Color } from '@react-stately/color';
import { useSwatchFocus } from './useSwatchFocus.js';
import { sameColor, toColor, type ColorValue } from './colorValue.js';
import { flag } from '../../../internal/flag.js';
import '../../../styles/Base.css';
import '../../../styles/ColorPicker.css';

/** A preset color, as a CSS color string or React Aria's Color, or with a name of its own. */
export type ColorPickerSwatch = ColorValue | { color: ColorValue; label: string };

export interface SwatchListProps {
  swatches: readonly ColorPickerSwatch[];
  value: Color;
  onChange: (color: Color) => void;
  alpha: boolean;
  disabled: boolean;
  label: string;
}

export function SwatchList({ swatches, value, onChange, alpha, disabled, label }: SwatchListProps) {
  const { locale } = useLocale();
  const items = swatches.map((swatch, index) => {
    const hasOwnLabel = typeof swatch === 'object' && 'label' in swatch;
    const color = toColor(hasOwnLabel ? swatch.color : swatch, alpha);
    return {
      key: String(index),
      color,
      name: hasOwnLabel ? swatch.label : color.getColorName(locale),
    };
  });
  const selected = items.find((item) => sameColor(item.color, value));
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const swatchFocus = useSwatchFocus({
    keys: items.map((item) => item.key),
    disabled,
    activeKey: activeKey ?? selected?.key ?? null,
    onActiveKeyChange: setActiveKey,
  });
  return (
    <div
      role="listbox"
      aria-label={label}
      aria-orientation="horizontal"
      aria-disabled={disabled || undefined}
      className="env-color-picker-swatches"
      {...swatchFocus.listProps}
    >
      {items.map((item) => {
        const choose = () => {
          if (!disabled) onChange(item.color);
        };
        return (
          <div
            key={item.key}
            role="option"
            aria-selected={item === selected}
            aria-label={item.name}
            aria-disabled={disabled || undefined}
            className="env-color-picker-swatch"
            data-selected={flag(item === selected)}
            data-translucent={flag(item.color.getChannelValue('alpha') < 1)}
            style={{ '--_color-swatch-color': item.color.toString('css') }}
            {...swatchFocus.swatchProps(item.key)}
            onClick={choose}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              choose();
            }}
          />
        );
      })}
    </div>
  );
}
