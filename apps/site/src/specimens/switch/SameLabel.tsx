import SameLabel from '../../examples/switch/SameLabel';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { toggling } from './Toggling';

const script = toggling(false);

function Toggled() {
  usePointer(script);
  return <SameLabel />;
}

/** The switch turned off and on by a pointer no one sees, in step with its pair. */
export default function SameLabelMotion() {
  return (
    <MotionStage label="the switch turned off and on, its label kept">
      <Toggled />
    </MotionStage>
  );
}
