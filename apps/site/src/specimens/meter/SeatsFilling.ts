import { createElement, useState, type ReactNode } from 'react';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';

/*
 * The do and the don't of a full meter play one script, side by side, on one clock: the pointer
 * presses Assign a seat twice, filling the plan from 3 to 5 of 5, its button then disabled, and the
 * plan holds full a moment. It then fades out and is drawn anew at 3, as no one in the figure frees
 * the seats.
 */
const script: PointerStep[] = [
  { wait: 420 },
  { to: '.env-button', x: 0.5, y: 0.6 },
  { wait: 270 },
  { click: true },
  { wait: 960 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 2040 },
  { cue: 'fade' },
  { wait: 240 },
  { cue: 'again' },
  { wait: 180 },
];

/** The round the figure is in, counted as it is drawn anew, and whether it is fading out. */
export function useSeats() {
  const [{ round, fading }, setState] = useState({ round: 0, fading: false });
  usePointer(script, {
    clock: 'meter-seats',
    onCue: (cue) =>
      setState((last) =>
        cue === 'fade' ? { ...last, fading: true } : { round: last.round + 1, fading: false },
      ),
  });
  return { round, fading };
}

/** The seats assigned, from 3, one more with each press of the plan's button. */
export function useAssigned() {
  const [seats, setSeats] = useState(3);
  return { seats, assign: () => setSeats((count) => Math.min(count + 1, 5)) };
}

/**
 * The plan's card, faded out at the end of the script and drawn anew as it starts again, so its
 * meter starts at 3 rather than running back down.
 */
export function Refilling({
  round,
  fading,
  children,
}: {
  round: number;
  fading: boolean;
  children: ReactNode;
}) {
  // A module of helpers, so no JSX: the box fades, and its child is drawn anew each round.
  return createElement(
    'div',
    {
      style: {
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        opacity: fading ? 0 : 1,
        transition: 'opacity 200ms ease',
      },
    },
    createElement('div', { key: round, style: { display: 'contents' } }, children),
  );
}
