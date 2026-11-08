import { useState } from 'react';
import OpenOnError from '../../examples/disclosure/OpenOnError';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

/*
 * Advanced settings closed. The pointer presses Save site: the domain has a space, so the
 * disclosure opens itself onto the field and its error. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button[type="submit"]', x: 0.55, y: 0.6 },
  { wait: 1000 },
  { click: true },
  { wait: 2600 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Saving() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the form with its settings open, so the fields above stay put as they open.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '15.25rem',
      }}
    >
      <Renew round={round}>
        <OpenOnError />
      </Renew>
    </div>
  );
}

/** A disclosure that opens itself onto an error when the pointer saves the form. */
export default function OpenOnErrorMotion() {
  return (
    <MotionStage label="the disclosure opening onto an error">
      <Saving />
    </MotionStage>
  );
}
