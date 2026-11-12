import type { PointerStep } from '../../motion/pointer/PointerPlan';

/*
 * The do's and the don't's pointer turn their switch off and on again together, the don't's a
 * moment after, so neither waits for the other's press (a page has one mouse) and they stay in
 * step; the don't's label says the state as it changes, the do's stays.
 */
export const toggling = (later: boolean): PointerStep[] => [
  { wait: 300 },
  { to: '.env-switch-input' },
  // 120 ms is a little more than a click's press.
  { wait: 360 + (later ? 120 : 0) },
  { click: true },
  { wait: 1140 },
  { click: true },
  { wait: 840 - (later ? 120 : 0) },
  { leave: true },
  { wait: 360 },
];
