'use client';

import { useRef } from 'react';
import { useColorArea } from '@react-aria/color';
import { useColorAreaState, type Color } from '@react-stately/color';
import { flag } from '../../internal/flag.js';
import '../../styles/Base.css';
import '../../styles/ColorPicker.css';

export interface ColorAreaProps {
  /** The color it shows. */
  value: Color;
  /** Receives the color as the area moves. */
  onChange: (color: Color) => void;
  /** Receives the color once a drag or a key press ends. */
  onChangeEnd?: (color: Color) => void;
  /** Whether it takes no input. */
  disabled: boolean;
  /** The picker's label, which names the area with React Aria's "Color picker". */
  label: string;
}

/**
 * The saturation and brightness of a color over its hue, on React Aria's useColorArea: a group
 * with a thumb, and two visually hidden range inputs that the arrow keys move.
 */
export function ColorArea({ value, onChange, onChangeEnd, disabled, label }: ColorAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputXRef = useRef<HTMLInputElement>(null);
  const inputYRef = useRef<HTMLInputElement>(null);
  const state = useColorAreaState({
    value,
    onChange,
    onChangeEnd,
    colorSpace: 'hsb',
    xChannel: 'saturation',
    yChannel: 'brightness',
    isDisabled: disabled,
  });
  const { colorAreaProps, thumbProps, xInputProps, yInputProps } = useColorArea(
    {
      containerRef,
      inputXRef,
      inputYRef,
      isDisabled: disabled,
      'aria-label': label,
      colorSpace: 'hsb',
      xChannel: 'saturation',
      yChannel: 'brightness',
    },
    state,
  );
  return (
    <div
      {...colorAreaProps}
      ref={containerRef}
      className="env-color-picker-area"
      data-disabled={flag(disabled)}
    >
      <div
        {...thumbProps}
        className="env-color-picker-thumb"
        data-dragging={flag(state.isDragging)}
        style={{ ...thumbProps.style, backgroundColor: state.getDisplayColor().toString('css') }}
      >
        <input {...xInputProps} ref={inputXRef} />
        <input {...yInputProps} ref={inputYRef} />
      </div>
    </div>
  );
}
