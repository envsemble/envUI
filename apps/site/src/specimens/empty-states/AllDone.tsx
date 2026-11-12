import { useState } from 'react';
import AllDone from '../../examples/empty-states/AllDone';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const approve = '.env-list-item:first-child .env-button';

/*
 * The pointer approves Launch brief, then Budget 2026, each row leaving, and the queue says No
 * reviews waiting, with what comes next. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: approve, x: 0.5, y: 2.4 },
  { to: approve, x: 0.5, y: 0.6, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { to: approve, x: 0.5, y: 0.6, duration: 250 },
  { wait: 120 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { wait: 1320 },
  { cue: 'renew' },
  { wait: 420 },
];

function Approving() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the done state, so the heading keeps its place as the queue empties.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '13rem' }}
    >
      <Renew round={round}>
        {/* As wide as the done state, so the queue keeps its width as it empties. */}
        <div style={{ inlineSize: 'min(100%, 30rem)' }}>
          <AllDone />
        </div>
      </Renew>
    </div>
  );
}

/** A queue of reviews approved by a pointer no one sees, until none is waiting. */
export default function AllDoneMotion() {
  return (
    <MotionStage label="the last reviews approved">
      <Approving />
    </MotionStage>
  );
}
