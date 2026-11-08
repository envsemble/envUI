import StickyHeader from '../../examples/table/StickyHeader';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The pointer turns the wheel over the table: its rows scroll down through the months, under the
 * header, which stays, and back up to January.
 */
const script: PointerStep[] = [
  { wait: 600 },
  { to: '.env-table-region', x: 0.45, y: 0.6 },
  { wait: 400 },
  { wheel: 150, duration: 1100 },
  { wait: 700 },
  { wheel: 150, duration: 1100 },
  { wait: 1100 },
  { wheel: -300, duration: 1500 },
  { wait: 500 },
  { leave: true },
  { wait: 700 },
];

function Scrolling() {
  usePointer(script);
  return <StickyHeader />;
}

/** The sales by month, scrolled by a pointer no one sees under a header that stays. */
export default function StickyHeaderMotion() {
  return (
    <MotionStage label="the rows scrolling under the header">
      <Scrolling />
    </MotionStage>
  );
}
