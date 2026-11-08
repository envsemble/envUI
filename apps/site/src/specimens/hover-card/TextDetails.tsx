import TextDetails from '../../examples/hover-card/TextDetails';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const trigger = '[tabindex="0"]';

/*
 * The pointer rests on the dotted "28 h 9 min", and its card opens with the week's breakdown;
 * then the pointer leaves, and the card closes.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: trigger, x: 0.5, y: 2.5 },
  { to: trigger, x: 0.5, y: 0.6, duration: 500 },
  { wait: 2600 },
  { to: trigger, x: 1.6, y: 2.2, duration: 450 },
  { leave: true },
  { wait: 800 },
];

function Hovering() {
  usePointer(script);
  return (
    // The line keeps to the top of the stage, so the card has room to open below it.
    <div style={{ display: 'grid', alignContent: 'start', minBlockSize: '9rem' }}>
      <TextDetails />
    </div>
  );
}

/** Text with more details, its card opened by a resting pointer no one sees. */
export default function TextDetailsMotion() {
  return (
    <MotionStage label="the card opening from text">
      <Hovering />
    </MotionStage>
  );
}
