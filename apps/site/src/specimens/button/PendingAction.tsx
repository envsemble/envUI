import PendingAction from '../../examples/button/PendingAction';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

/*
 * The pointer presses Save changes: a spinner takes the label's place at the same width, and a
 * second press does nothing. The save ends, and the button comes back; then Refresh does the same.
 * The example's work takes 1.8 s.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 540 },
  { click: true },
  { wait: 1740 },
  { to: '.env-icon-button', x: 0.5, y: 0.55, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 1980 },
  { leave: true },
  { wait: 420 },
];

function Saving() {
  usePointer(script);
  return <PendingAction />;
}

/** Save changes and Refresh, each pressed by a pointer no one sees while their work runs. */
export default function PendingActionMotion() {
  return (
    <MotionStage label="the buttons pending while their work runs">
      <Saving />
    </MotionStage>
  );
}
