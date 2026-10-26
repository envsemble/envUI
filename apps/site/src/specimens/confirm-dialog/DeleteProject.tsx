import DeleteProject from '../../examples/confirm-dialog/DeleteProject';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/*
 * The pointer presses Delete project: the danger dialog opens over the stage and asks first. The
 * pointer reads a moment, then presses Cancel, and nothing is deleted.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 1700 },
  { to: '.env-dialog-actions .env-button:first-child', x: 0.5, y: 0.6, duration: 500 },
  { wait: 450 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 900 },
];

function Deleting() {
  usePointer(script);
  return <DeleteProject />;
}

/** The overview's Delete project, which asks first, pressed by a pointer no one sees. */
export default function DeleteProjectMotion() {
  return (
    <MotionStage label="the dialog asking before deleting" height="18rem">
      <Deleting />
    </MotionStage>
  );
}
