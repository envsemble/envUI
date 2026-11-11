import type { PointerStep } from '../../motion/pointer/PointerPlan';

/** The clock the do and the don't press Bold on together. */
export const pressingClock = 'toolbar-bold-pressed';

const bold = '.env-toolbar-button[aria-label="Bold"]';

/*
 * The pointer presses Bold, pressed at first, so it lets go, and moves aside to show it; then it
 * presses it again. It never rests on Bold long enough for its tooltip. The do and the don't
 * play it on one clock, side by side.
 */
export const pressing: PointerStep[] = [
  { wait: 500 },
  { to: bold, x: 0.5, y: 2.4 },
  { to: bold, x: 0.5, y: 0.55, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 150 },
  { to: bold, x: 0.5, y: 2.4, duration: 350 },
  { wait: 1400 },
  { to: bold, x: 0.5, y: 0.55, duration: 350 },
  { wait: 300 },
  { click: true },
  { wait: 150 },
  { to: bold, x: 0.5, y: 2.4, duration: 350 },
  { wait: 1400 },
  { leave: true },
  { wait: 300 },
];
