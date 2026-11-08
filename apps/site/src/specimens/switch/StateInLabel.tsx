import StateInLabel from '../../examples/switch/StateInLabel';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { toggling } from './Toggling';

const script = toggling(true);

function Toggled() {
  usePointer(script);
  return <StateInLabel />;
}

/** The switch turned off and on by a pointer no one sees, in step with its pair. */
export default function StateInLabelMotion() {
  return (
    <MotionStage label="the switch turned off and on, its label changing">
      <Toggled />
    </MotionStage>
  );
}
