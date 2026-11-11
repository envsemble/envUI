import EveryNumberRolls from '../../examples/animated-number/EveryNumberRolls';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { invitingTwo } from './Seats';

function Inviting() {
  usePointer(invitingTwo);
  return (
    // As wide as its longest sentence, so nothing moves as the numbers change.
    <div style={{ inlineSize: '13.75rem' }}>
      <EveryNumberRolls />
    </div>
  );
}

/** Three numbers rolling at once as a pointer no one sees invites people. */
export default function EveryNumberRollsMotion() {
  return (
    <MotionStage label="three numbers rolling at once">
      <Inviting />
    </MotionStage>
  );
}
