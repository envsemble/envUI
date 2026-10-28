import UndoArchive from '../../examples/toast/UndoArchive';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const archive = 'button[aria-label="Archive Onboarding emails"]';
const undo = '.env-toast-action';

/*
 * The pointer archives Onboarding emails: the row leaves, and a notification with Undo arrives.
 * The pointer presses Undo, and the row comes back as the notification closes.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: archive, x: 0.5, y: 2 },
  { to: archive, x: 0.5, y: 0.55, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1400 },
  { to: undo, duration: 700 },
  { wait: 500 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 1600 },
];

function Archiving() {
  usePointer(script);
  return (
    // As wide and tall as the three rows, at the top, so the others stay put as one leaves.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: 'min(100%, 18rem)',
        blockSize: '10rem',
      }}
    >
      <UndoArchive />
    </div>
  );
}

/** A project archived and brought back with Undo by a pointer no one sees. */
export default function UndoArchiveMotion() {
  return (
    <MotionStage label="a project archived and brought back with Undo" height="18rem">
      <Archiving />
    </MotionStage>
  );
}
