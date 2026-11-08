import { useState } from 'react';
import FindPlan from '../../examples/dialog/FindPlan';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-dialog input';
const roadmap = '.env-dialog .env-list-item:first-child .env-button';

/*
 * The pointer opens Find a plan: the dialog opens near the top of the stage, its field alone.
 * It types "road": the results grow down below the field, which stays where it is, and narrow
 * to Northwind roadmap, which the pointer opens. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 700 },
  { to: field, x: 0.45, y: 0.55, duration: 500 },
  { wait: 200 },
  { click: true },
  { wait: 200 },
  { type: 'road', into: field, every: 380 },
  { wait: 1100 },
  { to: roadmap, x: 0.5, y: 0.6, duration: 550 },
  { wait: 350 },
  { click: true },
  { wait: 1500 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Finding() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall and wide as the button and the status below it, so the button stays put as the
    // status shows.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '4.8125rem',
      }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: '13rem' }}>
          <FindPlan />
        </div>
      </Renew>
    </div>
  );
}

/** Find a plan, opened near the top and searched by a pointer no one sees. */
export default function FindPlanMotion() {
  return (
    <MotionStage label="the dialog near the top as its results grow" height="38.5rem">
      <Finding />
    </MotionStage>
  );
}
