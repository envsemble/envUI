import ResizableColumns from '../../examples/table/ResizableColumns';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const boundary = '.env-table-column-resize-handle';

/*
 * The pointer drags the boundary after Name toward the end until the plan's whole title shows,
 * then double-clicks it, which restores the starting widths.
 */
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

/** The documents' Name column dragged wider by a pointer no one sees, and restored. */
export default function ResizableColumnsMotion() {
  return (
    <MotionStage label="a column dragged wider and restored">
      <Resizing />
    </MotionStage>
  );
}
