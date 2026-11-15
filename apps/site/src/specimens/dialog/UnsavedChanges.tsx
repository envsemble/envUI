import { useState } from 'react';
import UnsavedChanges from '../../examples/dialog/UnsavedChanges';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const buttonWithStatusHeight = '4.8125rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 240 },
  { click: true },
  { wait: 780 },
  { to: '.env-dialog-actions .env-button:nth-child(2)', x: 0.5, y: 0.6, duration: 550 },
  { wait: 210 },
  { click: true },
  { wait: 840 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Closing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: buttonWithStatusHeight,
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

export default function UnsavedChangesMotion() {
  return (
    <MotionStage label="a dialog closed by Don’t save" height="17rem">
      <Closing />
    </MotionStage>
  );
}
