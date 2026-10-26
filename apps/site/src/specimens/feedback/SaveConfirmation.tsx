import { useState } from 'react';
import SaveConfirmation from '../../examples/feedback/SaveConfirmation';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { Renew } from '../../previews/Renew';

const send = 'button[type="submit"]';

/*
 * The pointer presses Send invitation: the button works a moment, and a notification arrives at
 * the stage's edge, "Invitation sent to jordan.kim@example.com.", and leaves by itself. Then the
 * form starts anew, its address filled in again.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: send, x: 0.5, y: 2 },
  { to: send, x: 0.5, y: 0.6, duration: 450 },
  { wait: 350 },
  { click: true },
  { wait: 300 },
  { leave: true },
  // The work, then the notification's own time on the stage, and its leaving.
  { wait: 11000 },
  { cue: 'renew' },
  { wait: 700 },
];

function Inviting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // The form at the top, with room below it for the notification.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '19rem' }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: 'min(100%, 24rem)' }}>
          <SaveConfirmation />
        </div>
      </Renew>
    </div>
  );
}

/** The invitation form, sent by a pointer no one sees, and the notification of its outcome. */
export default function SaveConfirmationMotion() {
  return (
    <MotionStage label="the invitation sent and its notification">
      <Inviting />
    </MotionStage>
  );
}
