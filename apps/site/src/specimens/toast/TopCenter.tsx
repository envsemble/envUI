import TopCenter from '../../examples/toast/TopCenter';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const dismiss = '.env-toast[data-tone="danger"] .env-toast-dismiss';

/*
 * The pointer presses Send reminder four times: the reminders arrive at the top, the oldest
 * waiting behind a count past two, and the reminder that couldn't be sent shows anyway. The
 * pointer dismisses it, a waiting one comes back, and they close by themselves.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-button', x: 0.5, y: 1.8 },
  { to: '.env-button', x: 0.55, y: 0.55, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 1000 },
  { click: true },
  { wait: 1000 },
  { click: true },
  { wait: 1300 },
  { click: true },
  { wait: 1700 },
  { to: dismiss, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { leave: true },
  // The reminders' time runs on, and the last has closed well before the loop ends.
  { wait: 14500 },
];

function Reminding() {
  usePointer(script);
  return (
    // The button low on the stage, below the notifications that arrive at its top.
    <div
      style={{ display: 'grid', justifyItems: 'center', alignContent: 'end', blockSize: '16rem' }}
    >
      <TopCenter />
    </div>
  );
}

/** Send reminder, pressed four times by a pointer no one sees, and its notifications. */
export default function TopCenterMotion() {
  return (
    <MotionStage label="notifications waiting behind a count" height="20rem">
      <Reminding />
    </MotionStage>
  );
}
