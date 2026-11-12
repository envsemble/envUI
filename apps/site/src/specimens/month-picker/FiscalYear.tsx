import { Column } from '@envsemble/envui';
import FiscalYear from '../../examples/month-picker/FiscalYear';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, rowsAnd } from '../../figures/MotionStage';

/*
 * The pointer opens Budget month, where the months before April are unavailable, and presses Next
 * year: the months after March are, and Next year is too, at the fiscal year's end. It goes back a
 * year and closes the popup with Esc.
 */
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
  // The field and the room its popup opens into, as tall as the two are open.
  return (
    <Column align="center" style={{ inlineSize: '100%', blockSize: rowsAnd(5.625, 9.75) }}>
      <FiscalYear />
    </Column>
  );
}

/** The fiscal year's months, paged to its end by a pointer no one sees. */
export default function FiscalYearMotion() {
  return (
    <MotionStage label="the fiscal year's limit">
      <Paging />
    </MotionStage>
  );
}
