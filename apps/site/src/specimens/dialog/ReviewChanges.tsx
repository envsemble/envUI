import ReviewChanges from '../../examples/dialog/ReviewChanges';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor } from '../../figures/MotionStage';

const roomForWrappedDialogWhenNarrow = roomFor(0, 27.5, 30);

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 240 },
  { click: true },
  { wait: 540 },
  { to: '.env-dialog tbody tr:nth-child(1)', x: 0.3, y: 0.5, duration: 600 },
  { to: '.env-dialog tbody tr:nth-child(3)', x: 0.4, y: 0.5, duration: 900 },
  { wait: 180 },
  { to: '.env-dialog-actions .env-button:last-child', x: 0.5, y: 0.6, duration: 550 },
  { wait: 180 },
  { click: true },
  { wait: 240 },
  { leave: true },
  { wait: 480 },
];

function Reviewing() {
  usePointer(script);
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minBlockSize: roomForWrappedDialogWhenNarrow,
      }}
    >
      <ReviewChanges />
    </div>
  );
}

export default function ReviewChangesMotion() {
  return (
    <MotionStage label="the large dialog opening and closing" height="26rem">
      <Reviewing />
    </MotionStage>
  );
}
