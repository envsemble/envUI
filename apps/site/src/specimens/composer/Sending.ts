import { createElement, type ReactNode } from 'react';
import type { PointerStep } from '../../motion/pointer/PointerPlan';

/*
 * The do and the don't of a composer while a send is in progress play on one timeline, side by
 * side: each pointer clicks into its empty field at the same moment, types the same message and
 * sends it with Enter at the same moment. Each send takes 1.5 s; both scripts last as long, so the
 * two stay in step loop after loop. Typing plays at 0.8 of its written pace (PointerPlan.ts).
 */

const field = '.env-composer-input';
// A point beside the composer, on the room around it (Room): a press there takes focus from the
// field.
const away = { to: '[data-catalogue-room]', x: 0.5, y: 0.08 } as const;

const start: PointerStep[] = [
  { wait: 300 },
  { to: field, x: 0.3, y: 0.5 },
  { wait: 180 },
  { click: true },
  { wait: 120 },
  { type: 'Is the budget final?', into: field, every: 55 },
  { wait: 240 },
  { key: 'Enter', on: field },
];

/** The do: the field stays editable while the send is in progress, and the next message is typed. */
export const keepsWriting: PointerStep[] = [
  ...start,
  { wait: 180 },
  { type: 'Great, thanks!', into: field, every: 50 },
  // Sent once the first has gone.
  { wait: 840 },
  { key: 'Enter', on: field },
  { wait: 1800 },
  // Done writing: a click away from the composer, which leaves it as it began.
  away,
  { wait: 60 },
  { click: true },
  { leave: true },
  { wait: 900 },
];

/**
 * The don't: the field is disabled while the send is in progress, which takes focus from it, a
 * press away standing in for the browser's taking it. Once it is back, the pointer must click into
 * it again before it can type the next message.
 */
export const losesFocus: PointerStep[] = [
  ...start,
  away,
  { click: true },
  { wait: 1560 },
  { to: field, x: 0.3, y: 0.5 },
  { wait: 180 },
  { click: true },
  { type: 'Great, thanks!', into: field, every: 50 },
  { wait: 240 },
  { key: 'Enter', on: field },
  away,
  { click: true },
  { leave: true },
  { wait: 1620 },
];

/** The room around a composer, which a press away from it lands on. */
export function Room({ children }: { children: ReactNode }) {
  return createElement(
    'div',
    {
      'data-catalogue-room': '',
      style: {
        display: 'grid',
        justifyItems: 'center',
        paddingBlock: '1.5rem',
        inlineSize: '100%',
      },
    },
    children,
  );
}
