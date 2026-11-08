import RemoveWithUndo from '../../examples/file-upload/RemoveWithUndo';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const remove = '[aria-label="Remove budget-2026.xlsx"]';

/*
 * The pointer presses Remove on the spreadsheet: its row leaves at once, and a notification says
 * so and offers Undo. The pointer presses Undo, and the row comes back to its place.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: remove, x: 0.5, y: 2.4 },
  { to: remove, x: 0.5, y: 0.55, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1200 },
  { to: '.env-toast-action', x: 0.5, y: 0.55, duration: 700 },
  { wait: 400 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 600 },
];

function Removing() {
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
        minBlockSize: '17rem',
      }}
    >
      <RemoveWithUndo />
    </div>
  );
}

/** A file removed at once by a pointer no one sees, and brought back with Undo. */
export default function RemoveWithUndoMotion() {
  return (
    <MotionStage label="a file removed and brought back">
      <Removing />
    </MotionStage>
  );
}
