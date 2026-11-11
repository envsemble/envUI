import ReviewChanges from '../../examples/dialog/ReviewChanges';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor } from '../../figures/MotionStage';

/*
 * The pointer presses Review changes: the large dialog opens over the stage with its table of
 * changed documents. The pointer reads down the table a moment, then presses Mark as reviewed.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { to: '.env-dialog tbody tr:nth-child(1)', x: 0.3, y: 0.5, duration: 600 },
  { to: '.env-dialog tbody tr:nth-child(3)', x: 0.4, y: 0.5, duration: 900 },
  { wait: 300 },
  { to: '.env-dialog-actions .env-button:last-child', x: 0.5, y: 0.6, duration: 550 },
  { wait: 300 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 800 },
];

function Reviewing() {
  usePointer(script);
  return (
    // On a narrow stage, where the table's rows wrap, room for the whole dialog.
    <div style={{ display: 'grid', placeItems: 'center', minBlockSize: roomFor(0, 27.5, 30) }}>
      <ReviewChanges />
    </div>
  );
}

/** The large dialog, with its table, opened and closed by a pointer no one sees. */
export default function ReviewChangesMotion() {
  return (
    <MotionStage label="the large dialog opening and closing" height="26rem">
      <Reviewing />
    </MotionStage>
  );
}
