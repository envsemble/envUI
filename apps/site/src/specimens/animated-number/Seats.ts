import type { PointerStep } from '../../motion/pointer/PointerPlan';

const add = '[aria-label="Invite one more person"]';
const remove = '[aria-label="Invite one person fewer"]';

/*
 * The pointer invites two more people with +, a moment apart, then takes them back with −, so the
 * seats end where they began.
 */
export const invitingTwo: PointerStep[] = [
  { wait: 500 },
  { to: add },
  { wait: 350 },
  { click: true },
  { wait: 1100 },
  { click: true },
  { wait: 1300 },
  { to: remove, duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 1100 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 900 },
];
