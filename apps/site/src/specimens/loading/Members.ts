/*
 * The members the Rules' first do and don't wait for, on one timeline: a while loading, then the
 * members land and stay a while to read.
 */
export const members = [
  { id: 'alex', name: 'Alex Morgan', role: 'Designer' },
  { id: 'priya', name: 'Priya Shah', role: 'Product manager' },
  { id: 'sam', name: 'Sam Lee', role: 'Engineer' },
];

export const membersSteps = [2000, 3400];

/** The clock the do and the don't share, so they play side by side in step. */
export const membersClock = 'loading-members';
