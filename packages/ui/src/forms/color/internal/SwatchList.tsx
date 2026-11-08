'use client';

import { useState, type CSSProperties } from 'react';
import { useLocale } from '@react-aria/i18n';
import type { Color } from '@react-stately/color';
import { useRovingFocus } from '../../../internal/useRovingFocus.js';
import { sameColor, toColor, type ColorValue } from './colorValue.js';
import { flag } from '../../../internal/flag.js';
import '../../../styles/Base.css';
import '../../../styles/ColorPicker.css';

/** A preset color, as a CSS color string or React Aria's Color, or with a name of its own. */
export type ColorPickerSwatch = ColorValue | { color: ColorValue; label: string };

export interface SwatchListProps {
  swatches: readonly ColorPickerSwatch[];
  /** The picker's color, which selects the swatch of the same color. */
  value: Color;
  /** Receives a swatch's color as it is chosen. */
  onChange: (color: Color) => void;
  /** Whether the swatches keep their alpha. */
  alpha: boolean;
  disabled: boolean;
  /** Names the list. */
  label: string;
}

/**
 * Preset colors as a listbox of swatches: the arrow keys move between them, and a press, Enter or
 * Space chooses one. Each is named by its label, or else by the color's description.
 */
export function SwatchList({ swatches, value, onChange, alpha, disabled, label }: SwatchListProps) {
  const { locale } = useLocale();
  const items = swatches.map((swatch, index) => {
    const own = typeof swatch === 'object' && 'label' in swatch;
    const color = toColor(own ? swatch.color : swatch, alpha);
    return {
      key: String(index),
      color,
      name: own ? swatch.label : color.getColorName(locale),
    };
  });
  const selected = items.find((item) => sameColor(item.color, value));
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const roving = useRovingFocus({
    items,
    getKey: (item) => item.key,
    orientation: 'horizontal',
    loop: true,
    isDisabled: () => disabled,
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
      {...roving.getContainerProps()}
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
            style={{ '--env-color-swatch-color': item.color.toString('css') } as CSSProperties}
            {...roving.getItemProps(item)}
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
