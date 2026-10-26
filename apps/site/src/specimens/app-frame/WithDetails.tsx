import WithDetails from '../../examples/app-frame/WithDetails';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const close = '[aria-label="Close"]';

/*
 * The pointer presses Details: the supporting pane opens, beside the page in a wide frame and as a
 * sheet in a narrow one. It rests a moment, and the pointer closes it.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-panes-trigger', x: 0.5, y: 2.4 },
  { to: '.env-panes-trigger', x: 0.5, y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1500 },
  { to: close, x: 0.5, y: 0.5, duration: 700 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 500 },
];

function Opening() {
  usePointer(script);
  return <WithDetails />;
}

/** The documents page, whose details a pointer no one sees opens beside it and closes. */
export default function WithDetailsMotion() {
  return (
    <MotionStage label="the details opening beside the page" stage="shaded">
      <Opening />
    </MotionStage>
  );
}
