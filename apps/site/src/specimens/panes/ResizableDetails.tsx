import ResizableDetails from '../../examples/panes/ResizableDetails';
import { useMustShow } from '../../motion/Playback';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const handle = '.env-panes-resize-handle';
const panes = '.env-panes';

const detailsBesideTheSeam = '.env-panes-pane:last-child .env-description-list-value';

const script: PointerStep[] = [
  { wait: 300 },
  { to: handle, x: 0.5, y: 0.5 },
  { wait: 240 },
  { press: true },
  { to: panes, x: 0.56, y: 0.5, duration: 1000 },
  { wait: 240 },
  { to: panes, x: 0.83, y: 0.5, duration: 1300 },
  { wait: 180 },
  { release: true },
  { wait: 180 },
  { leave: true },
  { wait: 300 },
  { focus: handle },
  { wait: 300 },
  { key: 'ArrowLeft' },
  { wait: 270 },
  { key: 'ArrowLeft' },
  { wait: 270 },
  { key: 'ArrowLeft' },
  { wait: 270 },
  { key: 'ArrowLeft' },
  { wait: 540 },
  { blur: true },
  { wait: 480 },
];

function Resizing() {
  usePointer(script);
  useMustShow(detailsBesideTheSeam);
  return <ResizableDetails />;
}

export default function ResizableDetailsMotion() {
  return (
    <MotionStage label="the details resized by pointer and keys">
      <Resizing />
    </MotionStage>
  );
}
