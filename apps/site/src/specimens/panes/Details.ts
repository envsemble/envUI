import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { useSharedTimeline } from '../../motion/Timeline';

/** The pair's widths, in rem: a medium window, side by side, and a compact one. */
export const widths = [38, 20];

/**
 * The pair's steps, in step with each other: side by side; narrowing; narrow, where the do's
 * pointer opens the details; and widening again.
 */
const steps = [1320, 2040, 3360, 2040];

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
  { wait: 180 },
  { to: '.env-panes-trigger', x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 1140 },
  { to: '.env-panes-close .env-button', duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 2400 },
];
