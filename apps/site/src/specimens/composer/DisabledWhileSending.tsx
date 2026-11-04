import DisabledWhileSending from '../../examples/composer/DisabledWhileSending';
import { usePointer } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { losesFocus, Room } from './Sending';

function Writing() {
  usePointer(losesFocus);
  return (
    <Room>
      <DisabledWhileSending />
    </Room>
  );
}

/** The don't: a message sent, and the field disabled meanwhile, losing focus (Sending.ts). */
export default function DisabledWhileSendingMotion() {
  return (
    <MotionStage label="the field disabled while a message sends">
      <Writing />
    </MotionStage>
  );
}
