import { useState } from 'react';
import PendingButton from '../../examples/loading/PendingButton';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const save = 'button[type="submit"]';

/*
 * The pointer presses Save changes: the button shows its work at the same size, and then the
 * status says the project saved. Then the form starts anew. The example's save takes 1.5 s.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: save, x: 0.5, y: 2.2 },
  { to: save, x: 0.55, y: 0.6, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 48 },
  // Off the button it pressed, so its spinner shows clear while it works.
  { to: save, x: 1.3, y: 1.9, duration: 300 },
  { wait: 120 },
  { leave: true },
  { wait: 2400 },
  { cue: 'renew' },
  { wait: 360 },
];

function Saving() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the form with its status, so the button keeps its place as the status comes.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '10rem' }}
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
