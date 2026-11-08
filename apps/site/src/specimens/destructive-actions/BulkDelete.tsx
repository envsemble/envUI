import BulkDelete from '../../examples/destructive-actions/BulkDelete';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const tick = (row: number) => `.env-list-item:nth-child(${row} of .env-list-item) .env-checkbox`;
const deleteButton = '.env-button[data-tone="danger"]';

/*
 * The pointer ticks two documents: the button reads "Delete 2 documents…". It opens the dialog,
 * which asks "Delete 2 documents?", and cancels; then it clears the selection.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: tick(2), x: 0.5, y: 2 },
  { to: tick(2), duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 300 },
  { to: tick(3), duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: deleteButton, x: 0.5, y: 0.6, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 1700 },
  { to: '.env-dialog-actions .env-button:first-child', x: 0.5, y: 0.6, duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { to: '.env-button', x: 0.5, y: 0.6, duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 500 },
];

function Deleting() {
  usePointer(script);
  return (
    // As wide as the list with its bar from the start, so it keeps its width as the bar fills.
    <div style={{ inlineSize: 'min(100%, 26rem)' }}>
      <BulkDelete />
    </div>
  );
}

/** Two documents ticked by a pointer no one sees, their deletion asked about and cancelled. */
export default function BulkDeleteMotion() {
  return (
    <MotionStage label="two documents ticked and their deletion cancelled" height="22rem">
      <Deleting />
    </MotionStage>
  );
}
