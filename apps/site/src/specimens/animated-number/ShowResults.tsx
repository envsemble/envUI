import ShowResults from '../../examples/animated-number/ShowResults';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const box = (index: number) =>
  `.env-checkbox:nth-child(${index} of .env-checkbox) .env-checkbox-box`;

/*
 * The pointer ticks Done, and the count in the button rolls up; it unticks Open, and the count
 * rolls down. It ticks Open again and unticks Done, which brings the count back where it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: box(3) },
  { wait: 350 },
  { click: true },
  { wait: 1300 },
  { to: box(1), duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1300 },
  { click: true },
  { wait: 1100 },
  { to: box(3), duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 900 },
];

function Choosing() {
  usePointer(script);
  return (
    // As wide as the button with its widest count, so nothing moves as the count changes.
    <div style={{ inlineSize: '8.25rem' }}>
      <ShowResults />
    </div>
  );
}

/** The overview's filters, ticked and unticked by a pointer no one sees, and the count rolling. */
export default function ShowResultsMotion() {
  return (
    <MotionStage label="the count rolling as the filters change">
      <Choosing />
    </MotionStage>
  );
}
