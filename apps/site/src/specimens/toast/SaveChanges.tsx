import SaveChanges from '../../examples/toast/SaveChanges';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

/*
 * The pointer presses Save changes: the button works a moment, and a notification arrives at the
 * stage's bottom end. The pointer rests on it, which keeps it, then leaves, and it closes by
 * itself.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 450 },
  { click: true },
  { wait: 2300 },
  { to: '.env-toast', x: 0.45, y: 0.55, duration: 600 },
  { wait: 1800 },
  { leave: true },
  // Its time runs on from where the pointer held it, and it is gone well before the loop ends.
  { wait: 8600 },
];

function Saving() {
  usePointer(script);
  return <SaveChanges />;
}

/** The overview's Save changes, pressed by a pointer no one sees, and its notification. */
export default function SaveChangesMotion() {
  return (
    <MotionStage label="the notification arriving and closing" height="16rem">
      <Saving />
    </MotionStage>
  );
}
