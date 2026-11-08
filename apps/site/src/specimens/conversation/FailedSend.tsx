import { useState } from 'react';
import FailedSend from '../../examples/conversation/FailedSend';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-composer-input';

/*
 * The pointer writes a reply and sends it: it shows it is on its way, then that it wasn't sent,
 * with Try again. The pointer presses Try again, and it goes through. Then the conversation starts
 * anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: field, x: 0.3, y: 0.5 },
  { wait: 250 },
  { click: true },
  { type: 'Yes, Northwind Hall from six.', into: field, every: 60 },
  { wait: 300 },
  { to: '.env-composer-action', x: 0.5, y: 0.55, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 1700 },
  { to: '.env-message-actions .env-button', x: 0.5, y: 0.6, duration: 600 },
  { wait: 400 },
  { click: true },
  { wait: 1900 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Sending() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // The composer stays where it is as messages arrive above it.
    <div
      style={{
        display: 'grid',
        alignContent: 'end',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '16rem',
      }}
    >
      <Renew round={round}>
        <FailedSend />
      </Renew>
    </div>
  );
}

/** A message that fails to send, sent again by a pointer no one sees. */
export default function FailedSendMotion() {
  return (
    <MotionStage label="a message that fails and is sent again">
      <Sending />
    </MotionStage>
  );
}
