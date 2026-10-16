'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import {
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

/** A color as hue (0–360), saturation and value, or brightness (0–100). */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** An opaque #rrggbb color as hue, saturation and brightness. */
export function hexToHsv(hex: string): Hsv {
  const number = Number.parseInt(hex.replace(/^#/, ''), 16);
  const [r, g, b] = [(number >> 16) & 255, (number >> 8) & 255, number & 255].map((c) => c / 255);
  const max = Math.max(r!, g!, b!);
  const delta = max - Math.min(r!, g!, b!);
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g! - b!) / delta) % 6;
    else if (max === g) h = (b! - r!) / delta + 2;
    else h = (r! - g!) / delta + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : (delta / max) * 100, v: max * 100 };
}

/** Hue, saturation and brightness as an opaque lowercase #rrggbb color. */
export function hsvToHex({ h, s, v }: Hsv) {
  const saturation = s / 100;
  const value = v / 100;
  const channel = (n: number) => {
    const k = (n + h / 60) % 6;
    const c = value - value * saturation * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(5)}${channel(3)}${channel(1)}`;
}

export interface ColorPlaneProps {
  /** The color it shows. */
  hsv: Hsv;
  /** Receives the color the pointer or the keyboard moves to. */
  onChange: (next: Hsv) => void;
  /** Names the saturation and brightness area. */
  areaLabel: string;
  /** The area's value in words, from its saturation and brightness. */
  areaValueText: (hsv: Hsv) => string;
  /** Names the hue slider. */
  hueLabel: string;
  /** The locale of the hue's number. */
  locale?: string;
}

/**
 * ColorPicker's area and hue: a two-dimensional slider for saturation (across) and brightness
 * (down) over the hue, which the pointer drags and the arrow keys move by 1 (10 with Shift, and Page
 * Up and Page Down for brightness), and the hue on a Slider under it.
 */
export function ColorPlane({
  hsv,
  onChange,
  areaLabel,
  areaValueText,
  hueLabel,
  locale,
}: ColorPlaneProps) {
  const area = useRef<HTMLDivElement>(null);
  const dragging = useRef<number | null>(null);

  function moveTo(event: ReactPointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;
    onChange({
      h: hsv.h,
      s: clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100),
      v: clamp(100 - ((event.clientY - bounds.top) / bounds.height) * 100, 0, 100),
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.shiftKey ? 10 : 1;
    let { s, v } = hsv;
    if (event.key === 'ArrowLeft') s -= step;
    else if (event.key === 'ArrowRight') s += step;
    else if (event.key === 'ArrowUp') v += step;
    else if (event.key === 'ArrowDown') v -= step;
    else if (event.key === 'PageUp') v += 10;
    else if (event.key === 'PageDown') v -= 10;
    else if (event.key === 'Home') s = 0;
    else if (event.key === 'End') s = 100;
    else return;
    event.preventDefault();
    onChange({ h: hsv.h, s: clamp(s, 0, 100), v: clamp(v, 0, 100) });
  }

  return (
    // The colors run left to right in every text direction, as in a picture, and so do the keys.
    <div
      className="env-color-picker-plane"
      dir="ltr"
      style={{ '--env-color-picker-hue': `hsl(${hsv.h} 100% 50%)` } as CSSProperties}
    >
      <div className="env-color-picker-saturation">
        <div
          ref={area}
          role="slider"
          tabIndex={0}
          aria-label={areaLabel}
          aria-valuetext={areaValueText(hsv)}
          aria-valuenow={Math.round(hsv.s)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="env-color-picker-saturation-slider"
          onPointerDown={(event) => {
            if (event.button !== 0 || dragging.current !== null) return;
            event.preventDefault();
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture(event.pointerId);
            dragging.current = event.pointerId;
            moveTo(event);
          }}
          onPointerMove={(event) => {
            if (dragging.current === event.pointerId) moveTo(event);
          }}
          onPointerUp={(event) => {
            if (dragging.current === event.pointerId) dragging.current = null;
          }}
          onPointerCancel={() => {
            dragging.current = null;
          }}
          onKeyDown={handleKeyDown}
        >
          <span
            className="env-color-picker-saturation-thumb"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
              backgroundColor: hsvToHex(hsv),
            }}
          />
        </div>
      </div>
      <DirectionProvider direction="ltr">
        <BaseSlider.Root
          className="env-color-picker-hue"
          value={hsv.h}
          min={0}
          max={360}
          step={1}
          largeStep={18}
          locale={locale}
          onValueChange={(next) => onChange({ ...hsv, h: next })}
        >
          <BaseSlider.Control className="env-color-picker-hue-control">
            <BaseSlider.Track className="env-color-picker-hue-track">
              <BaseSlider.Thumb className="env-color-picker-hue-thumb" aria-label={hueLabel} />
            </BaseSlider.Track>
          </BaseSlider.Control>
        </BaseSlider.Root>
      </DirectionProvider>
    </div>
  );
}
