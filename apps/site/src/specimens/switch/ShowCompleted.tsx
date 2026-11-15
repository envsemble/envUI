import ShowCompleted from '../../examples/switch/ShowCompleted';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const control = '.env-switch-input';

const script: PointerStep[] = [
  { wait: 300 },
  { to: control, x: 0.5, y: 0.5 },
  { wait: 270 },
  { click: true },
  { wait: 1320 },
  { click: true },
  { wait: 720 },
  { leave: true },
  { wait: 420 },
];

const roomForTheLongerList = { inlineSize: '22rem', minBlockSize: '18.5rem' };

function Switching() {
  usePointer(script);
  return (
    <div
      style={{
        inlineSize: roomForTheLongerList.inlineSize,
        maxInlineSize: '100%',
        minBlockSize: roomForTheLongerList.minBlockSize,
      }}
    >
      <ShowCompleted />
    </div>
  );
}

export default function ShowCompletedMotion() {
  return (
    <MotionStage label="completed tasks shown at once" height="23.5rem">
      <Switching />
    </MotionStage>
  );
}
