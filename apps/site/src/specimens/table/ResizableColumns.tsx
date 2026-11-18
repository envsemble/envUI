import ResizableColumns from '../../examples/table/ResizableColumns';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const boundary = '.env-table-column-resize-handle';

const script: PointerStep[] = [
  { wait: 300 },
  { to: boundary, x: 0.5, y: 0.5 },
  { wait: 300 },
  { press: true },
  { to: '.env-table-region', x: 0.92, y: 0.2, duration: 1400 },
  { wait: 180 },
  { release: true },
  { wait: 900 },
  { to: boundary, x: 0.5, y: 0.5, duration: 500 },
  { wait: 240 },
  { doubleClick: true },
  { wait: 720 },
  { leave: true },
  { wait: 360 },
];

function Resizing() {
  usePointer(script);
  return <ResizableColumns />;
}

export default function ResizableColumnsMotion() {
  return (
    <MotionStage label="a column dragged wider and restored">
      <Resizing />
    </MotionStage>
  );
}
