import type { PointerStep } from '../../motion/pointer/PointerPlan';

const moreThanAClickPressMs = 120;

export const toggling = (afterThePairedPointer: boolean): PointerStep[] => {
  const stagger = afterThePairedPointer ? moreThanAClickPressMs : 0;
  return [
    { wait: 300 },
    { to: '.env-switch-input' },
    { wait: 360 + stagger },
    { click: true },
    { wait: 1140 },
    { click: true },
    { wait: 840 - stagger },
    { leave: true },
    { wait: 360 },
  ];
};
