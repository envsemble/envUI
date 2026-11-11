import ShowCompleted from '../../examples/switch/ShowCompleted';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const control = '.env-switch-input';

/*
 * The pointer turns on Show completed tasks, and the completed tasks join the list at once; it
 * turns the switch off again, and they go.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: control, x: 0.5, y: 0.5 },
  { wait: 450 },
  { click: true },
  { wait: 2200 },
  { click: true },
  { wait: 1200 },
  { leave: true },
  { wait: 700 },
];

function Switching() {
  usePointer(script);
  // In room for the longer list, as wide as the example can be, so the switch stays where it is
  // as the list grows below it.
  return (
    <div style={{ inlineSize: '22rem', maxInlineSize: '100%', minBlockSize: '18.5rem' }}>
      <ShowCompleted />
    </div>
  );
}

/** The tasks, with the completed ones shown and hidden by the switch above them. */
export default function ShowCompletedMotion() {
  return (
    <MotionStage label="completed tasks shown at once" height="23.5rem">
      <Switching />
    </MotionStage>
  );
}
