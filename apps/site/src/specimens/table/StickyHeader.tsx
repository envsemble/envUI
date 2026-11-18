import StickyHeader from '../../examples/table/StickyHeader';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 360 },
  { to: '.env-table-region', x: 0.45, y: 0.6 },
  { wait: 240 },
  { wheel: 150, duration: 1100 },
  { wait: 420 },
  { wheel: 150, duration: 1100 },
  { wait: 660 },
  { wheel: -300, duration: 1500 },
  { wait: 300 },
  { leave: true },
  { wait: 420 },
];

function Scrolling() {
  usePointer(script);
  return <StickyHeader />;
}

export default function StickyHeaderMotion() {
  return (
    <MotionStage label="the rows scrolling under the header">
      <Scrolling />
    </MotionStage>
  );
}
