'use client';

import { useRef } from 'react';
import { useColorSlider } from '@react-aria/color';
import { useColorSliderState, type Color, type ColorChannel } from '@react-stately/color';
import { useLocale } from '@react-aria/i18n';
import { classNames } from '../../internal/classNames.js';

export interface ColorSliderProps {
  /** The channel it moves: hue or alpha. */
  channel: Extract<ColorChannel, 'hue' | 'alpha'>;
  /** The color it shows. */
  value: Color;
  /** Receives the color as the slider moves. */
  onChange: (color: Color) => void;
  /** Receives the color once a drag or a key press ends. */
  onChangeEnd?: (color: Color) => void;
  /** Whether it takes no input. */
  disabled: boolean;
}

/**
 * One channel of a color on a track that shows it, on React Aria's useColorSlider: a thumb over a
 * visually hidden range input named after the channel, such as Hue or Alpha.
 */
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
  });
  const { trackProps, thumbProps, inputProps } = useColorSlider(
    { channel, colorSpace: 'hsb', trackRef, inputRef, isDisabled: disabled },
    state,
  );
  return (
    <div
      className={classNames('env-color-picker-slider', `env-color-picker-${channel}`)}
      data-channel={channel}
      data-disabled={disabled || undefined}
    >
      <div
        {...trackProps}
        ref={trackRef}
        className="env-color-picker-track"
        style={
          channel === 'alpha'
            ? // The alpha gradient over a checkerboard, which shows through translucent colors.
              {
                ...trackProps.style,
                background: `${trackProps.style?.background}, var(--env-color-picker-checkerboard)`,
              }
            : trackProps.style
        }
      >
        <div
          {...thumbProps}
          className="env-color-picker-thumb"
          data-dragging={state.isDragging || undefined}
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
