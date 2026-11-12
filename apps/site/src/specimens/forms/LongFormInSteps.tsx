import { useState } from 'react';
import LongFormInSteps from '../../examples/forms/LongFormInSteps';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const name = 'form input.env-text-field-input';
const description = 'form textarea';
const next = 'button[type="submit"]';
const back = 'form .env-button[data-variant="secondary"]:not(.env-select-trigger)';

/*
 * The pointer fills in step 1 and presses Continue: the progress moves on to Team. It goes Back,
 * where the answers are still there, then continues to the last step, which shows them all. Then
 * the form starts over.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: name, x: 0.5, y: 2.4 },
  { to: name, x: 0.5, y: 0.5, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 90 },
  { type: 'Website refresh', into: name, every: 85 },
  { wait: 150 },
  { to: description, x: 0.5, y: 0.4, duration: 350 },
  { wait: 90 },
  { click: true },
  { wait: 90 },
  { type: 'New pages for the spring launch.', into: description, every: 55 },
  { wait: 210 },
  { to: next, x: 0.5, y: 0.55, duration: 500 },
  { wait: 120 },
  { click: true },
  { wait: 720 },
  { to: back, x: 0.5, y: 0.55, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 780 },
  { to: next, x: 0.5, y: 0.55, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 540 },
  { to: next, x: 0.5, y: 0.55, duration: 200 },
  { click: true },
  { wait: 1140 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Stepping() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the longest step, so the figure keeps its height from step to step.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '24.5rem',
      }}
    >
      <Renew round={round}>
        <LongFormInSteps />
      </Renew>
    </div>
  );
}

/** A form in three steps, filled in, gone back through and reviewed by a pointer no one sees. */
export default function LongFormInStepsMotion() {
  return (
    <MotionStage label="the steps filled in, gone back through and reviewed">
      <Stepping />
    </MotionStage>
  );
}
