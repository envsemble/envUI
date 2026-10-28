import ProjectDetails from '../../examples/dialog/ProjectDetails';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The pointer presses View project: the dialog opens over the stage, its close button and its
 * primary action at the end. The pointer reads a moment, then presses Close.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 450 },
  { click: true },
  { wait: 1500 },
  { to: '.env-dialog-actions .env-button:first-child', x: 0.5, y: 0.6, duration: 500 },
  { wait: 450 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 900 },
];

function Viewing() {
  usePointer(script);
  return <ProjectDetails />;
}

/** The overview's dialog, opened and closed by a pointer no one sees, over the stage. */
export default function ProjectDetailsMotion() {
  return (
    <MotionStage label="the dialog opening and closing" height="20rem">
      <Viewing />
    </MotionStage>
  );
}
