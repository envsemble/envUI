import CheckedRows from '../../examples/list/CheckedRows';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const box = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) .env-list-item-start`;

/*
 * Pricing research is checked. The pointer checks Roadmap and then Interview notes, and the button
 * counts up, to Download 2 files and then 3 files; it unchecks them again, and the count goes back
 * to 1 file, as it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: box(1) },
  { wait: 450 },
  { click: true },
  { wait: 800 },
  { to: box(3), duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 1400 },
  { to: box(3), x: 0.6 },
  { wait: 300 },
  { click: true },
  { wait: 500 },
  { to: box(1), duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 1000 },
];

function Checking() {
  usePointer(script);
  return <CheckedRows />;
}

/** Files checked one by one by a pointer no one sees, the button counting them. */
export default function CheckedRowsMotion() {
  return (
    <MotionStage label="rows checked for an action">
      <Checking />
    </MotionStage>
  );
}
