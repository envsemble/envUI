import { useState } from 'react';
import UnsavedChanges from '../../examples/dialog/UnsavedChanges';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

/*
 * The pointer presses Close editor: the dialog asks whether to save the changes. The pointer
 * presses Don’t save, which discards them and closes the dialog. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 1300 },
  { to: '.env-dialog-actions .env-button:nth-child(2)', x: 0.5, y: 0.6, duration: 550 },
  { wait: 350 },
  { click: true },
  { wait: 1400 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Closing() {
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
        <div style={{ inlineSize: '12rem' }}>
          <UnsavedChanges />
        </div>
      </Renew>
    </div>
  );
}

/** Don’t save, a button that closes the dialog after its own work, pressed by a pointer. */
export default function UnsavedChangesMotion() {
  return (
    <MotionStage label="a dialog closed by Don’t save" height="17rem">
      <Closing />
    </MotionStage>
  );
}
