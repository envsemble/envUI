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
  { wait: 500 },
  { to: '.env-date-picker-control', x: 0.4, y: 0.55 },
  { wait: 350 },
  { click: true },
  { wait: 1100 },
  { to: '.env-month-picker-next', duration: 550 },
  { wait: 300 },
  { click: true },
  { wait: 1900 },
  { to: '.env-month-picker-previous', duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { key: 'Escape', on: '.env-month-picker-popup' },
  { wait: 300 },
  { leave: true },
  { wait: 900 },
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
