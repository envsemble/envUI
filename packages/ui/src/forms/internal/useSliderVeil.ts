'use client';

import { useEffect, useLayoutEffect, type ReactNode, type RefObject } from 'react';
import '../../styles/Base.css';
import '../../styles/Slider.css';

/**
 * Marks where the slider's indicators pass under the label or the value, within half a line of
 * either, so the stylesheet fades them there while they show. --env-slider-veil on the control is 1
 * where the end of the fill and the handle sit under the text, and 0 elsewhere. For the ticks,
 * --env-slider-clear-start and --env-slider-clear-end bound the stretch clear of the text, from the
 * track's left side, physical as the ticks are, so that either direction works.
 */
function veilIndicatorUnderText(control: HTMLElement) {
  const thumb = control.querySelector('.env-slider-thumb');
  const track = control.querySelector('.env-slider-track');
  if (!thumb || !track) return;
  const handle = thumb.getBoundingClientRect();
  const span = track.getBoundingClientRect();
  const at = handle.left + handle.width / 2;
  let veiled = false;
  let clearStart = 0;
  let clearEnd = span.width;
  for (const text of control.querySelectorAll<HTMLElement>(
    '.env-slider-label, .env-slider-value',
  )) {
    const box = text.getBoundingClientRect();
    if (box.width === 0) continue;
    const margin = Number.parseFloat(getComputedStyle(text).fontSize) / 2 || 0;
    if (at >= box.left - margin && at <= box.right + margin) veiled = true;
    // The text in the track's left half bounds the clear stretch on the left, the other on the right.
    if (box.left + box.width / 2 < span.left + span.width / 2)
      clearStart = Math.max(clearStart, box.right + margin - span.left);
    else clearEnd = Math.min(clearEnd, box.left - margin - span.left);
  }
  control.style.setProperty('--env-slider-veil', veiled ? '1' : '0');
  control.style.setProperty('--env-slider-clear-start', `${clearStart}px`);
  control.style.setProperty('--env-slider-clear-end', `${clearEnd}px`);
}

/**
 * Where the fill's end and the handle pass under the label or the value, they fade while they show,
 * so the text stays legible at full strength: measured again as the value moves, as the label or
 * the value's format changes, as the slider or its text changes size, and where the handle comes to
 * rest after a glide. At rest the stylesheet ignores the measure.
 */
export function useSliderVeil(
  control: RefObject<HTMLElement | null>,
  value: number,
  label: ReactNode,
  formatValue: ((value: number) => string) | undefined,
) {
  useLayoutEffect(
    function veilAtCurrentValue() {
      if (control.current) veilIndicatorUnderText(control.current);
    },
    [control, value, label, formatValue],
  );
  useEffect(
    function veilOnResize() {
      const element = control.current;
      if (!element || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => veilIndicatorUnderText(element));
      observer.observe(element);
      for (const text of element.querySelectorAll('.env-slider-label, .env-slider-value'))
        observer.observe(text);
      const settle = (event: TransitionEvent) => {
        if (
          event.propertyName !== 'opacity' &&
          (event.target as Element).matches('.env-slider-thumb')
        )
          veilIndicatorUnderText(element);
      };
      element.addEventListener('transitionend', settle);
      return () => {
        observer.disconnect();
        element.removeEventListener('transitionend', settle);
      };
    },
    [control],
  );
}
