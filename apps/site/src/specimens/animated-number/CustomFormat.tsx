import CustomFormat from '../../examples/animated-number/CustomFormat';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const option = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

/* The pointer chooses Yearly, and the price rolls up; then Monthly, and it rolls back down. */
const script: PointerStep[] = [
  { wait: 500 },
  { to: option(2), x: 0.45, y: 0.55 },
  { wait: 350 },
  { click: true },
  { wait: 1700 },
  { to: option(1), x: 0.55, y: 0.55, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1300 },
  { leave: true },
  { wait: 900 },
];

function Choosing() {
  usePointer(script);
  return (
    // As wide as the yearly price's line, so nothing moves as the price changes.
    <div style={{ inlineSize: '13.75rem' }}>
      <CustomFormat />
    </div>
  );
}

/** The price per seat, rolling between monthly and yearly as a pointer no one sees switches. */
export default function CustomFormatMotion() {
  return (
    <MotionStage label="the price rolling between monthly and yearly">
      <Choosing />
    </MotionStage>
  );
}
