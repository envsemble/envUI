import { useRef, type CSSProperties } from 'react';

/** How long a figure takes to fade out before it starts again, and in again after. */
const fade = 200;

/**
 * For a progress figure whose bar can't run backwards: the round the timeline is in, counted each
 * time it comes to `start`, the step where the work starts again, to key the bar with, so it is
 * drawn anew at its start rather than emptying; and the style that fades it out at the step
 * before, `start - 1`, and in again from `start`.
 */
export function useRounds(step: number, start: number) {
  const seen = useRef({ step, round: 0 });
  if (seen.current.step !== step) {
    if (step === start) seen.current.round++;
    seen.current.step = step;
  }
  const style: CSSProperties = {
    opacity: step === start - 1 ? 0 : 1,
    transition: `opacity ${fade}ms ease`,
  };
  return { round: seen.current.round, style };
}
