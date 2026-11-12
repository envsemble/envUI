import type { PointerStep } from '../../motion/pointer/PointerPlan';

const add = '[aria-label="Invite one more person"]';
const remove = '[aria-label="Invite one person fewer"]';

/*
 * The pointer invites two more people with +, a moment apart, then takes them back with −, so the
 * seats end where they began.
 */
export const invitingTwo: PointerStep[] = [
  { wait: 300 },
  { to: add },
  { wait: 210 },
  { click: true },
  { wait: 660 },
  { click: true },
  { wait: 780 },
  { to: remove, duration: 400 },
  { wait: 180 },
  { click: true },
  { wait: 660 },
  { click: true },
  { wait: 660 },
  { leave: true },
  { wait: 540 },
];
