import type { PointerStep } from '../../motion/PointerPlan';

/** The clock the do and the don't of filtering by status play on together. */
export const statusClock = 'filtering-status';

const status = '.env-select-trigger';
const option = (index: number) => `.env-select-item:nth-child(${index})`;

/**
 * What the pointer does in the do and the don't, in step: it picks Active, presses Apply where
 * there is one, then puts Any status back the same way. Where there is no Apply, it looks at the
 * list over the same time, so both scripts keep one length.
 */
export function statusScript(apply: boolean): PointerStep[] {
  const press: PointerStep[] = apply
    ? [
        { to: '.env-button[data-variant="primary"]', x: 0.5, y: 0.55, duration: 600 },
        { wait: 200 },
        { click: true },
      ]
    : [{ to: '.env-list', x: 0.7, y: 0.4, duration: 600 }, { wait: 200 }, { wait: 150 }];
  const pick = (index: number): PointerStep[] => [
    { to: status, x: 0.45, y: 0.55, duration: 450 },
    { wait: 200 },
    { click: true },
    { wait: 450 },
    { to: option(index), x: 0.4, y: 0.5, duration: 350 },
    { wait: 200 },
    { click: true },
    { wait: 900 },
  ];
  return [
    { wait: 400 },
    { to: status, x: 0.45, y: 2.4 },
    ...pick(2),
    ...press,
    { wait: 1600 },
    ...pick(1),
    ...press,
    { wait: 1200 },
    { leave: true },
    { wait: 400 },
  ];
}
