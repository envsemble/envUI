import SeatsLeft from '../../examples/animated-number/SeatsLeft';
import { usePointer } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { invitingTwo } from './Seats';

function Inviting() {
  usePointer(invitingTwo);
  return (
    // As wide as its longest sentence, so nothing moves as the numbers change.
    <div style={{ inlineSize: '10rem' }}>
      <SeatsLeft />
    </div>
  );
}

/** Seats left, the one number that rolls as a pointer no one sees invites people. */
export default function SeatsLeftMotion() {
  return (
    <MotionStage label="the seats left rolling">
      <Inviting />
    </MotionStage>
  );
}
