import { useEffect, useRef } from 'react';
import { useSharedTimeline } from '../../motion/Motion';

/*
 * The refresh the Rules' second do and don't play, on one timeline: a while to read, the pointer
 * coming onto Refresh, its press, the refresh's own 1.5 s, and a while to read again. Both figures
 * press their Refresh in the same step, by the marks the pointer no one sees sets, so the button
 * shows its own hover and press, and the example does the rest.
 */
const steps = [1600, 300, 150, 2500, 1400];
const clock = 'loading-refresh';
const hover = 'data-catalogue-hover';
const pressed = 'data-catalogue-pressed';

/** The box to hold the example in, whose Refresh button the timeline presses. */
export function useRefreshPress() {
  const step = useSharedTimeline(clock, steps);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const button = box.current?.querySelector<HTMLButtonElement>('.env-button');
    if (!button) return;
    button.toggleAttribute(hover, step >= 1 && step <= 3);
    button.toggleAttribute(pressed, step === 2);
    // The press ends in a click as the button is let go.
    if (step === 3) button.click();
  }, [step]);
  return box;
}
