import { Column } from '@envsemble/envui';
import ReportMonth from '../../examples/month-picker/ReportMonth';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, rowsAnd } from '../../motion/MotionStage';

const field = '.env-date-picker-control';
const month = (index: number) =>
  `.env-month-picker-month[data-month="2026-${String(index).padStart(2, '0')}"]`;

/*
 * The pointer opens Report month, runs over a few months and picks November: the popup closes and
 * the field says November 2026. It opens it again and picks October, as it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: field, x: 0.4, y: 0.55 },
  { wait: 350 },
  { click: true },
  { wait: 500 },
  { to: month(8), duration: 450 },
  { wait: 300 },
  { to: month(12), duration: 400 },
  { wait: 300 },
  { to: month(11), duration: 300 },
  { wait: 450 },
  { click: true },
  { wait: 1400 },
  { to: field, x: 0.4, y: 0.55, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 500 },
  { to: month(10), duration: 450 },
  { wait: 450 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 900 },
];

function Choosing() {
  usePointer(script);
  // The popup opens below the field, in the room under it, as tall as the two are open, so they
  // sit in the middle of the stage.
  return (
    <Column align="center" style={{ inlineSize: '100%', blockSize: rowsAnd(5.625, 9.75) }}>
      <ReportMonth />
    </Column>
  );
}

/** Report month chosen from its popup by a pointer no one sees. */
export default function ChoosingAMonth() {
  return (
    <SpecimenFrame>
      <MotionStage label="a month chosen">
        <Choosing />
      </MotionStage>
    </SpecimenFrame>
  );
}
