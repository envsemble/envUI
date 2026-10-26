import { useState } from 'react';
import PendingButton from '../../examples/loading/PendingButton';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { Renew } from '../../previews/Renew';

const save = 'button[type="submit"]';

/*
 * The pointer presses Save changes: the button shows its work at the same size, and then the
 * status says the project saved. Then the form starts anew. The example's save takes 1.5 s; the
 * waits here are paced to 0.6 of what they say.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: save, x: 0.5, y: 2.2 },
  { to: save, x: 0.55, y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 4400 },
  { cue: 'renew' },
  { wait: 600 },
];

function Saving() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the form with its status, so the button keeps its place as the status comes.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '9.5rem' }}
    >
      <Renew round={round}>
        <PendingButton />
      </Renew>
    </div>
  );
}

/** Save changes pressed by a pointer no one sees, pending while the project saves. */
export default function PendingButtonMotion() {
  return (
    <MotionStage label="the button pending while the project saves">
      <Saving />
    </MotionStage>
  );
}
