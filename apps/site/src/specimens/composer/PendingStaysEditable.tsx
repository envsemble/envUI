import PendingStaysEditable from '../../examples/composer/PendingStaysEditable';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { keepsWriting, Room } from './Sending';

function Writing() {
  usePointer(keepsWriting);
  return (
    <Room>
      <PendingStaysEditable />
    </Room>
  );
}

/** The do: a message sent, and the next typed while it is in progress (Sending.ts). */
export default function PendingStaysEditableMotion() {
  return (
    <MotionStage label="the field staying editable while a message sends">
      <Writing />
    </MotionStage>
  );
}
