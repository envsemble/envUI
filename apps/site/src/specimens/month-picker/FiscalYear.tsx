import { Column } from '@envsemble/envui';
import FiscalYear from '../../examples/month-picker/FiscalYear';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, rowsAnd } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-date-picker-control', x: 0.4, y: 0.55 },
  { wait: 210 },
  { click: true },
  { wait: 660 },
  { to: '.env-month-picker-next', duration: 550 },
  { wait: 180 },
  { click: true },
  { wait: 1140 },
  { to: '.env-month-picker-previous', duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { key: 'Escape', on: '.env-month-picker-popup' },
  { wait: 180 },
  { leave: true },
  { wait: 540 },
];

function Paging() {
  usePointer(script);
  return (
    <Column
      align="center"
      style={{
        inlineSize: '100%',
        blockSize: `calc(${rowsAnd(5.625, 9.75)} + var(--catalogue-touch-popup-room, 0rem))`,
      }}
    >
      <FiscalYear />
    </Column>
  );
}

export default function FiscalYearMotion() {
  return (
    <MotionStage label="the fiscal year's limit">
      <Paging />
    </MotionStage>
  );
}
