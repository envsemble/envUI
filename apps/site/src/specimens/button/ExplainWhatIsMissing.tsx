import ExplainWhatIsMissing from '../../examples/button/ExplainWhatIsMissing';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const field = '.env-text-field-input';
const create = '.env-button';

/*
 * The pointer presses Create project with no name: the field says what is missing. It types a
 * name, which clears the message, and presses Create project again, which creates the project and
 * empties the form.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: create, x: 0.55, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 1500 },
  { to: field, x: 0.3, duration: 500 },
  { click: true },
  { wait: 200 },
  { type: 'Spring launch', into: field, every: 90 },
  { wait: 500 },
  { to: create, x: 0.55, y: 0.6, duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 900 },
];

function Creating() {
  usePointer(script);
  return (
    // As tall as the form with its message, so the field stays put as the message comes and goes.
    <div style={{ minBlockSize: '8rem' }}>
      <ExplainWhatIsMissing />
    </div>
  );
}

/** Create project, pressed before the name is filled in, and the field saying what is missing. */
export default function ExplainWhatIsMissingMotion() {
  return (
    <MotionStage label="the field saying what is missing" height="13rem">
      <Creating />
    </MotionStage>
  );
}
