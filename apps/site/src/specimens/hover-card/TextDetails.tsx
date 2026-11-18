import TextDetails from '../../examples/hover-card/TextDetails';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const trigger = '[tabindex="0"]';

const script: PointerStep[] = [
  { wait: 300 },
  { to: trigger, x: 0.5, y: 2.5 },
  { to: trigger, x: 0.5, y: 0.6, duration: 500 },
  { wait: 1560 },
  { to: trigger, x: 1.6, y: 2.2, duration: 450 },
  { leave: true },
  { wait: 480 },
];

function Hovering() {
  usePointer(script);
  return (
    <div style={{ display: 'grid', alignContent: 'start', minBlockSize: '9rem' }}>
      <TextDetails />
    </div>
  );
}

export default function TextDetailsMotion() {
  return (
    <MotionStage label="the card opening from text">
      <Hovering />
    </MotionStage>
  );
}
