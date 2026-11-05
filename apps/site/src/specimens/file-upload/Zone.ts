import type { PointerStep } from '../../motion/Motion';

/** The clock the do and the don't of a zone during uploads play on together. */
export const zoneClock = 'file-upload-zone';

const zone = '.env-drop-zone-target';

/** The file the pointer brings while two others upload. */
const carry: PointerStep = { carry: 'site-plan.pdf', as: 'application/pdf', size: 838_861 };

/**
 * Both scripts start with the example drawn anew, so its uploads start with the clock, and both
 * examples' uploads keep in step with the pointers.
 */
const start: PointerStep[] = [{ cue: 'renew' }, { wait: 600 }];

/**
 * The do: the pointer brings a third file while two upload and drops it at once; the zone takes
 * it, and it uploads beside them.
 */
export const readyScript: PointerStep[] = [
  ...start,
  carry,
  { to: zone, x: 0.6, y: 1.5 },
  { to: zone, x: 0.55, y: 0.55, duration: 600 },
  { wait: 300 },
  { drop: true },
  { wait: 200 },
  { leave: true },
  // As long as the don't, which waits for the zone.
  { wait: 9133 },
];

/**
 * The don't, on the same clock: the zone is busy, so the pointer holds the file over it until both
 * uploads are done, moves it off and on again as the zone opens, and drops it then.
 */
export const busyScript: PointerStep[] = [
  ...start,
  carry,
  { to: zone, x: 0.6, y: 1.5 },
  { to: zone, x: 0.55, y: 0.55, duration: 600 },
  { wait: 300 },
  { wait: 3500 },
  { to: zone, x: 0.55, y: 1.6, duration: 250 },
  { to: zone, x: 0.55, y: 0.55, duration: 300 },
  { wait: 300 },
  { drop: true },
  { wait: 200 },
  { leave: true },
  { wait: 4600 },
];
