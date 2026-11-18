'use client';

import { useRef } from 'react';
import { useColorArea } from '@react-aria/color';
import { useColorAreaState, type Color } from '@react-stately/color';
import { flag } from '../../../internal/flag.js';
import '../../../styles/Base.css';
import '../../../styles/ColorPicker.css';

export interface ColorAreaProps {
  value: Color;
  onChange: (color: Color) => void;
  onChangeEnd?: (color: Color) => void;
  disabled: boolean;
  label: string;
}

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
