import StoppedReply from '../../examples/conversation/StoppedReply';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The pointer presses Try again on the stopped reply: a new reply arrives a few words at a time,
 * and the send button is Stop. Part way, the pointer presses Stop: the reply keeps what arrived,
 * marked Stopped with Try again beside it, and the send button comes back.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-message-actions .env-button', x: 0.5, y: 1.6 },
  { to: '.env-message-actions .env-button', x: 0.5, y: 0.6, duration: 400 },
  { wait: 300 },
  { click: true },
  { to: '.env-composer-action', x: 0.5, y: 0.55, duration: 700 },
  { wait: 650 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 600 },
];

function Stopping() {
  usePointer(script);
  return (
    // The composer stays where it is as messages arrive above it.
    <div
      style={{
        display: 'grid',
        alignContent: 'end',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '18rem',
      }}
    >
      <StoppedReply />
    </div>
  );
}

/** A reply stopped part way by a pointer no one sees, which keeps what arrived. */
export default function StoppedReplyMotion() {
  return (
    <MotionStage label="a reply stopped part way">
      <Stopping />
    </MotionStage>
  );
}
