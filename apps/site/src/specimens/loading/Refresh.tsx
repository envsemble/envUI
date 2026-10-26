import { useEffect, useRef, type ReactNode } from 'react';
import { useSharedTimeline } from '../../previews/Motion';

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

export function Refreshing({ children }: { children: ReactNode }) {
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
  return (
    <div ref={box} style={{ inlineSize: 'min(100%, 22rem)' }}>
      {children}
    </div>
  );
}
