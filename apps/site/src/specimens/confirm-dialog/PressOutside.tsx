import DeleteProject from '../../examples/confirm-dialog/DeleteProject';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The pointer opens the dialog, then presses the backdrop beside it, twice: the dialog stays open, as
 * a press outside doesn't close a ConfirmDialog. Cancel closes it.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: '.env-dialog-backdrop', x: 0.1, y: 0.75, duration: 550 },
  { wait: 250 },
  { click: true },
  { wait: 400 },
  { click: true },
  { wait: 1100 },
  { to: '.env-dialog-actions .env-button:first-child', x: 0.5, y: 0.6, duration: 650 },
  { wait: 350 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 900 },
];

function PressingOutside() {
  usePointer(script);
  return <DeleteProject />;
}

/** The danger dialog, pressed outside to no effect, and closed with Cancel. */
export default function PressOutsideMotion() {
  return (
    <MotionStage label="a press outside leaving the dialog open" height="18rem">
      <PressingOutside />
    </MotionStage>
  );
}
