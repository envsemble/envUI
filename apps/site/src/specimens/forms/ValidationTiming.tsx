import { useState } from 'react';
import ValidationTiming from '../../examples/forms/ValidationTiming';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const address = 'input[name="address"]';
const email = 'input[name="email"]';

/*
 * The pointer types "My Team" into Workspace address: no error while it types. Tab leaves the
 * field, and its error shows. The pointer comes back and writes "my-team": the error goes as soon
 * as the address is right. Then the form starts anew.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: address, x: 0.6, y: 2.4 },
  { to: address, x: 0.6, y: 0.5, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 90 },
  { type: 'My Team', into: address, every: 130 },
  { wait: 300 },
  { key: 'Tab' },
  { focus: email },
  { wait: 900 },
  { to: address, x: 0.6, y: 0.5, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 120 },
  { erase: 7, into: address, every: 55 },
  { type: 'my-team', into: address, every: 120 },
  { wait: 840 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Checking() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the form with an error, so the figure keeps its height.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '18rem' }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: 'min(100%, 32rem)' }}>
          <ValidationTiming />
        </div>
      </Renew>
    </div>
  );
}

/** A field checked as a pointer no one sees leaves it, and its error gone once it is right. */
export default function ValidationTimingMotion() {
  return (
    <MotionStage label="a field checked as it is left, and fixed">
      <Checking />
    </MotionStage>
  );
}
