import type { PointerStep } from '../../motion/Motion';

const add = '.env-icon-button:nth-child(2 of .env-icon-button)';
const remove = '.env-icon-button:nth-child(1 of .env-icon-button)';

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
