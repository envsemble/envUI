'use client';

import { useRef } from 'react';
import { useColorSlider } from '@react-aria/color';
import { useColorSliderState, type Color, type ColorChannel } from '@react-stately/color';
import { useLocale } from '@react-aria/i18n';
import { classNames } from '../../../internal/classNames.js';
import { flag } from '../../../internal/flag.js';
import '../../../styles/Base.css';
import '../../../styles/ColorPicker.css';

export interface ColorSliderProps {
  channel: Extract<ColorChannel, 'hue' | 'alpha'>;
  value: Color;
  onChange: (color: Color) => void;
  onChangeEnd?: (color: Color) => void;
  disabled: boolean;
}

export function ColorSlider({ channel, value, onChange, onChangeEnd, disabled }: ColorSliderProps) {
  const { locale } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const state = useColorSliderState({
    channel,
    colorSpace: 'hsb',
    value,
    onChange,
    onChangeEnd,
    isDisabled: disabled,
    locale,
    orientation: 'vertical',
  });
  const { trackProps, thumbProps, inputProps } = useColorSlider(
    {
      channel,
      colorSpace: 'hsb',
      orientation: 'vertical',
      trackRef,
      inputRef,
      isDisabled: disabled,
    },
    state,
  );
  const alphaGradientOverCheckerboard = {
    ...trackProps.style,
    background: `${trackProps.style?.background}, var(--_color-picker-checkerboard)`,
  };
  return (
    <div
      className={classNames('env-color-picker-slider', `env-color-picker-${channel}`)}
      data-channel={channel}
      data-disabled={flag(disabled)}
    >
      <div
        {...trackProps}
        ref={trackRef}
        className="env-color-picker-track"
        style={channel === 'alpha' ? alphaGradientOverCheckerboard : trackProps.style}
      >
        <div
          {...thumbProps}
          className="env-color-picker-thumb"
          data-dragging={flag(state.isDragging)}
          style={{
            ...thumbProps.style,
            backgroundColor: state.getDisplayColor().toString('css'),
          }}
        >
          <input {...inputProps} ref={inputRef} />
        </div>
      </div>
    </div>
  );
}
