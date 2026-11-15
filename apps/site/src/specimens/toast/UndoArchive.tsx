import UndoArchive from '../../examples/toast/UndoArchive';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const archive = 'button[aria-label="Archive Onboarding emails"]';
const undo = '.env-toast-action';

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

const threeRowsHeight = '10rem';

function Archiving() {
  usePointer(script);
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: 'min(100%, 18rem)',
        blockSize: threeRowsHeight,
      }}
    >
      <UndoArchive />
    </div>
  );
}

export default function UndoArchiveMotion() {
  return (
    <MotionStage label="a project archived and brought back with Undo" height="18rem">
      <Archiving />
    </MotionStage>
  );
}
