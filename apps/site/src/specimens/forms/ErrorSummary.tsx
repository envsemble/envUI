import { useState } from 'react';
import ErrorSummary from '../../examples/forms/ErrorSummary';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const save = 'button[type="submit"]';
const emailLink = '.env-alert li:first-child a';
const email = 'input[name="email"]';

/*
 * The pointer presses Save details: the summary lists the two errors, and the fields show theirs.
 * It presses the email's link: focus moves to the field, where the address is finished, and its
 * error goes, from the field and the summary. Then the form starts anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: save, x: 0.5, y: 2.4 },
  { to: save, x: 0.5, y: 0.55, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 1300 },
  { to: emailLink, x: 0.3, y: 0.6, duration: 600 },
  { wait: 250 },
  { click: true },
  { focus: email },
  { wait: 300 },
  { type: 'example.com', into: email, every: 110 },
  { wait: 1500 },
  { blur: true },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Fixing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the form with its summary and errors, so the figure keeps its height.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '32rem' }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: 'min(100%, 32rem)' }}>
          <ErrorSummary />
        </div>
      </Renew>
    </div>
  );
}

/** A refused submit: the summary's link takes a pointer no one sees to the field it fixes. */
export default function ErrorSummaryMotion() {
  return (
    <MotionStage label="the errors listed and one fixed from its link">
      <Fixing />
    </MotionStage>
  );
}
