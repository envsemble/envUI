import SelectAll from '../../examples/checkbox/SelectAll';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const group = '[aria-label="Projects to export"]';
const parent = `${group} > .env-checkbox .env-checkbox-input`;
const child = (index: number) =>
  `${group} > * > .env-checkbox:nth-child(${index} of .env-checkbox) .env-checkbox-input`;

/*
 * One project of three is ticked, so All projects is mixed. The pointer ticks the other two, and
 * the parent turns checked; it presses the parent, which clears them all; it ticks the first
 * project, and the parent is mixed again, where it began.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: child(2) },
  { wait: 210 },
  { click: true },
  { wait: 270 },
  { to: child(3), duration: 300 },
  { wait: 120 },
  { click: true },
  { wait: 540 },
  { to: parent, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 540 },
  { to: child(1), duration: 400 },
  { wait: 150 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 540 },
];

function Selecting() {
  usePointer(script);
  return <SelectAll />;
}

/** A parent checkbox following its children as a pointer no one sees ticks them. */
export default function SelectAllMotion() {
  return (
    <MotionStage label="the parent following its children">
      <Selecting />
    </MotionStage>
  );
}
