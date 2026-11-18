import RowDensity from '../../examples/table/RowDensity';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const option = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

const choose = (index: number): PointerStep[] => [
  { to: option(index), x: 0.5, y: 0.6, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 600 },
];

const script: PointerStep[] = [
  { wait: 300 },
  { to: option(2), x: 0.5, y: 0.6 },
  { wait: 180 },
  ...choose(1),
  ...choose(2),
  ...choose(3),
  ...choose(4),
  ...choose(3),
  ...choose(2),
  { leave: true },
  { wait: 360 },
];

function Choosing() {
  usePointer(script);
  return (
    <div className="catalogue-row-density">
      <RowDensity />
    </div>
  );
}

export default function RowDensityMotion() {
  return (
    <MotionStage label="the rows at each density">
      <Choosing />
    </MotionStage>
  );
}
