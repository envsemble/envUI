import RowDensity from '../../examples/table/RowDensity';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage, roomFor } from '../../previews/MotionStage';

const option = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

/** Chooses a density: on to its option, a moment, and a click. */
const choose = (index: number): PointerStep[] => [
  { to: option(index), x: 0.5, y: 0.6, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1000 },
];

/*
 * The pointer goes through the densities from Extra small to Large and back to Small: the rows
 * breathe, while the buttons in them keep their height.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: option(2), x: 0.5, y: 0.6 },
  { wait: 300 },
  ...choose(1),
  ...choose(2),
  ...choose(3),
  ...choose(4),
  ...choose(3),
  ...choose(2),
  { leave: true },
  { wait: 600 },
];

function Choosing() {
  usePointer(script);
  // In room for the largest rows, so the control above them stays where it is.
  return (
    <div
      style={{
        minBlockSize: roomFor(22.5, 34.5, 29),
        inlineSize: '100%',
        display: 'grid',
        alignContent: 'start',
      }}
    >
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
