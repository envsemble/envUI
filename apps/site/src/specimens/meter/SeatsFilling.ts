import { createElement, useState, type ReactNode } from 'react';
import { useSharedTimeline } from '../../previews/Motion';

/*
 * The do and the don't of a full meter play one timeline, side by side: seats are assigned, 3, 4
 * and then 5 of 5, and the plan holds full a moment. It then fades out and is drawn anew at 3, as
 * no one in the figure frees the seats.
 */
const steps = [1000, 800, 2600, 400];
const fading = steps.length - 1;

/** The seats assigned now. */
export function useSeats() {
  const step = useSharedTimeline('meter-seats', steps);
  return { seats: Math.min(3 + step, 5), step };
}

/**
 * The plan's card, faded out at the end of the timeline and drawn anew as it starts again, so its
 * meter starts at 3 rather than running back down.
 */
export function Refilling({ step, children }: { step: number; children: ReactNode }) {
  const [round, setRound] = useState({ count: 0, step });
  if (round.step !== step) setRound({ count: round.count + (step === 0 ? 1 : 0), step });
  // A module of helpers, so no JSX: the box fades, and its child is drawn anew each round.
  return createElement(
    'div',
    {
      style: {
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        opacity: step === fading ? 0 : 1,
        transition: 'opacity 200ms ease',
      },
    },
    createElement('div', { key: round.count, style: { display: 'contents' } }, children),
  );
}
