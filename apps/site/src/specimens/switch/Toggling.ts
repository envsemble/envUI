import type { PointerStep } from '../../previews/Motion';

/*
 * The do's and the don't's pointer turn their switch off and on again together, the don't's a
 * moment after, so neither waits for the other's press (a page has one mouse) and they stay in
 * step; the don't's label says the state as it changes, the do's stays.
 */
export const toggling = (later: boolean): PointerStep[] => [
  { wait: 500 },
  { to: '.env-switch-input' },
  // Written waits play at 0.6 of their length: 200 is a little more than a click's press.
  { wait: 600 + (later ? 200 : 0) },
  { click: true },
  { wait: 1900 },
  { click: true },
  { wait: 1400 - (later ? 200 : 0) },
  { leave: true },
  { wait: 600 },
];
