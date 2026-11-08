import { useState } from 'react';
import SaveSection from '../../examples/settings/SaveSection';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const name = 'input[name="name"]';
const cancel = 'button[type="submit"] + .env-button';

/*
 * The pointer edits the display name, and the section's Unsaved changes badge appears. It presses
 * Cancel: the saved name comes back and the badge goes. Then the section starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: name, x: 0.85, y: 2.2 },
  { to: name, x: 0.85, y: 0.5, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 300 },
  { erase: 4, into: name, every: 110 },
  { type: 'Patel', into: name, every: 120 },
  { wait: 1100 },
  { to: cancel, x: 0.5, y: 0.6, duration: 700 },
  { wait: 300 },
  { click: true },
  { wait: 1500 },
  { leave: true },
  { cue: 'renew' },
  { wait: 600 },
];

function Editing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the section with its status, so the section keeps its place as the status comes.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '27rem',
      }}
    >
      <Renew round={round}>
        <SaveSection />
      </Renew>
    </div>
  );
}

/** The profile's section, edited by a pointer no one sees and put back with Cancel. */
export default function SaveSectionMotion() {
  return (
    <MotionStage label="the section's unsaved changes put back">
      <Editing />
    </MotionStage>
  );
}
