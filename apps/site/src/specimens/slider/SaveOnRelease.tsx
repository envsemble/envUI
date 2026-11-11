import SaveOnRelease from '../../examples/slider/SaveOnRelease';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const control = '.env-slider-control';

/*
 * The pointer drags the volume from 60% down to 35%, the value following it, and the setting is
 * saved only once it lets go; then it drags it back up to 60%, saved again.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: control, x: 0.6 },
  { wait: 500 },
  { press: true },
  { to: control, x: 0.35, duration: 1300 },
  { wait: 300 },
  { release: true },
  { wait: 1600 },
  { press: true },
  { to: control, x: 0.6, duration: 1300 },
  { wait: 300 },
  { release: true },
  { wait: 1200 },
  { leave: true },
  { wait: 800 },
];

function Dragging() {
  usePointer(script);
  return <SaveOnRelease />;
}

/** The volume dragged by a pointer no one sees, and saved once each drag is let go. */
export default function SaveOnReleaseMotion() {
  return (
    <MotionStage label="the value saved once the slider is let go">
      <Dragging />
    </MotionStage>
  );
}
