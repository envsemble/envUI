import Sticky from '../../examples/page/Sticky';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-page-content', x: 0.5, y: 0.4 },
  { wait: 240 },
  { wheel: 260, duration: 1600 },
  { wait: 780 },
  { wheel: -260, duration: 1300 },
  { wait: 300 },
  { leave: true },
  { wait: 480 },
];

function Scrolling() {
  usePointer(script);
  return (
    <div style={{ inlineSize: '100%' }}>
      <Sticky />
    </div>
  );
}

export default function StickyMotion() {
  return (
    <MotionStage label="the content scrolling under the header">
      <Scrolling />
    </MotionStage>
  );
}
