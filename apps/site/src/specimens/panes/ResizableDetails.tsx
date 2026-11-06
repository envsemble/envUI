import ResizableDetails from '../../examples/panes/ResizableDetails';
import { useMustShow, usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { useOnScreen } from '../../figures/DeviceFrame';
import { WidthSweep } from '../../motion/WidthSweep';

const divider = '.env-panes-divider';
const panes = '.env-panes';

/*
 * The pointer drags the gap toward the start, past where the details stop at their widest; then
 * toward the end, past where they stop at their least width. It lets go, and the keyboard takes the
 * gap: four presses of the left arrow widen the details a step each, back to where they began. The
 * points it heads to span both stops, so a window cut off at a phone's width holds one view as the
 * gap moves.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: divider, x: 0.5, y: 0.5 },
  { wait: 400 },
  { press: true },
  { to: panes, x: 0.47, y: 0.5, duration: 1000 },
  { wait: 400 },
  { to: panes, x: 0.83, y: 0.5, duration: 1300 },
  { wait: 300 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 500 },
  { focus: divider },
  { wait: 500 },
  { key: 'ArrowLeft' },
  { wait: 450 },
  { key: 'ArrowLeft' },
  { wait: 450 },
  { key: 'ArrowLeft' },
  { wait: 450 },
  { key: 'ArrowLeft' },
  { wait: 900 },
  { blur: true },
  { wait: 800 },
];

function Resizing() {
  usePointer(script);
  // The details stay in view beside the gap, on a window's screen cut off at a phone's width too.
  useMustShow('.env-panes-supporting .env-description-list-value');
  // A frame of a medium window, where the panes sit side by side, drawn smaller on a narrow stage;
  // on a window's screen, the window itself.
  const onScreen = useOnScreen();
  if (onScreen) return <ResizableDetails />;
  return (
    <WidthSweep widths={[40]} at={0} ruler={false} outline={false}>
      <ResizableDetails />
    </WidthSweep>
  );
}

/** The details resized by dragging the gap, and by the arrow keys. */
export default function ResizableDetailsMotion() {
  return (
    <MotionStage label="the details resized by pointer and keys">
      <Resizing />
    </MotionStage>
  );
}
