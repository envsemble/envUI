import SaveOnRelease from '../../examples/slider/SaveOnRelease';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const control = '.env-slider-control';

const script: PointerStep[] = [
  { wait: 300 },
  { to: control, x: 0.6 },
  { wait: 300 },
  { press: true },
  { to: control, x: 0.35, duration: 1300 },
  { wait: 180 },
  { release: true },
  { wait: 960 },
  { press: true },
  { to: control, x: 0.6, duration: 1300 },
  { wait: 180 },
  { release: true },
  { wait: 720 },
  { leave: true },
  { wait: 480 },
];

function Dragging() {
  usePointer(script);
  return <SaveOnRelease />;
}

export default function SaveOnReleaseMotion() {
  return (
    <MotionStage label="the value saved once the slider is let go">
      <Dragging />
    </MotionStage>
  );
}
