import UndoArchive from '../../examples/toast/UndoArchive';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const archive = 'button[aria-label="Archive Onboarding emails"]';
const undo = '.env-toast-action';

/*
 * The pointer archives Onboarding emails: the row leaves, and a notification with Undo arrives.
 * The pointer presses Undo, and the row comes back as the notification closes.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: archive, x: 0.5, y: 2 },
  { to: archive, x: 0.5, y: 0.55, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 840 },
  { to: undo, duration: 700 },
  { wait: 300 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { wait: 960 },
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
