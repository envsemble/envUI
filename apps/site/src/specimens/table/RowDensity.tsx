import RowDensity from '../../examples/table/RowDensity';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const option = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

/** Chooses a density: on to its option, a moment, and a click. */
const choose = (index: number): PointerStep[] => [
  { to: option(index), x: 0.5, y: 0.6, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 600 },
];

/*
 * The pointer goes through the densities from Extra small to Large and back to Small: the rows
 * breathe, while the buttons in them keep their height.
 */
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
  // Below the control, the room the rows still grow into (Examples.css), so the figure keeps one
  // height and the page never moves as they do.
  return (
    <div className="catalogue-row-density">
      <RowDensity />
    </div>
  );
}

/** The reports at each density, chosen by a pointer no one sees. */
export default function RowDensityMotion() {
  return (
    <MotionStage label="the rows at each density">
      <Choosing />
    </MotionStage>
  );
}
