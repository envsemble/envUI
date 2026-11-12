import { useState } from 'react';
import ErrorAfterLeaving from '../../examples/field/ErrorAfterLeaving';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-field-control';

/*
 * The pointer focuses the empty field and starts a name, then deletes it: no error while it is
 * in the field. It tabs away, leaving it empty, and only then does the field ask for a project
 * name. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: field, x: 0.3, y: 0.55 },
  { wait: 210 },
  { click: true },
  { wait: 180 },
  { type: 'Web', into: field, every: 160 },
  { wait: 270 },
  { erase: 3, into: field, every: 110 },
  { wait: 270 },
  { key: 'Tab', on: field },
  { wait: 1200 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Leaving() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the form with the error, so the button stays put as the error shows.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '10rem' }}
    >
      <Renew round={round}>
        <ErrorAfterLeaving />
      </Renew>
    </div>
  );
}

/** A field left empty by a pointer no one sees: its error shows only once it leaves. */
export default function ErrorAfterLeavingMotion() {
  return (
    <MotionStage label="the error showing once the field is left">
      <Leaving />
    </MotionStage>
  );
}
