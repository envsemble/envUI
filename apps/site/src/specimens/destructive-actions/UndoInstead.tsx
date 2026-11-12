import UndoInstead from '../../examples/destructive-actions/UndoInstead';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const archive = '[aria-label="Archive Website refresh"]';

/*
 * The pointer presses Archive on Website refresh: the row leaves at once, and a notification says
 * so and offers Undo. The pointer presses Undo, and the row comes back to its place.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: archive, x: 0.5, y: 2.4 },
  { to: archive, x: 0.5, y: 0.55, duration: 450 },
  { wait: 210 },
  { click: true },
  { wait: 720 },
  { to: '.env-toast-action', x: 0.5, y: 0.55, duration: 700 },
  { wait: 240 },
  { click: true },
  { wait: 660 },
  { leave: true },
  { wait: 360 },
];

function Archiving() {
  usePointer(script);
  return (
    // As tall as every row, so the list keeps its place as one leaves, with room below for the
    // notification.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '19rem',
      }}
    >
      <UndoInstead />
    </div>
  );
}

/** A project archived at once by a pointer no one sees, and brought back with Undo. */
export default function UndoInsteadMotion() {
  return (
    <MotionStage label="a project archived and brought back">
      <Archiving />
    </MotionStage>
  );
}
