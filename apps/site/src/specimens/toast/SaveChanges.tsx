import SaveChanges from '../../examples/toast/SaveChanges';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 270 },
  { click: true },
  { wait: 1380 },
  { to: '.env-toast', x: 0.45, y: 0.55, duration: 600 },
  { wait: 1080 },
  { leave: true },
  { wait: 5160 },
];

function Saving() {
  usePointer(script);
  return <SaveChanges />;
}

export default function SaveChangesMotion() {
  return (
    <MotionStage label="the notification arriving and closing" height="16rem">
      <Saving />
    </MotionStage>
  );
}
