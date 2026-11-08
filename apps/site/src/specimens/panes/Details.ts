import type { PointerStep } from '../../motion/PointerPlan';
import { useSharedTimeline } from '../../motion/Timeline';

/** The pair's widths, in rem: a medium window, side by side, and a compact one. */
export const widths = [38, 20];

/**
 * The pair's steps, in step with each other: side by side; narrowing; narrow, where the do's
 * pointer opens the details; and widening again.
 */
const steps = [2200, 3400, 5600, 3400];

/**
 * Where a do's or a don't's panes are, in step with the other of the pair: the width's index for
 * WidthSweep's `at`, and whether they are narrow now, when the do's pointer opens the details.
 */
export function useNarrowing() {
  const step = useSharedTimeline('panes-details', steps);
  return { at: step === 1 || step === 2 ? 1 : 0, narrow: step === 2 };
}

/*
 * Narrow, the pointer presses Details, the details rise as a sheet, and it closes them. It plays
 * from its start each time the pair is narrow.
 */
export const opening: PointerStep[] = [
  { wait: 300 },
  { to: '.env-panes-trigger', x: 0.55, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 1900 },
  { to: '.env-panes-close .env-button', duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 4000 },
];
