import { useState } from 'react';
import RequiredChoice from '../../examples/radio/RequiredChoice';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const exportButton = 'button[type="submit"]';
const formWithErrorOrResultHeight = '11rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: exportButton, x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 900 },
  { to: '.env-radio:nth-child(2 of .env-radio) .env-radio-input', duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { to: exportButton, x: 0.55, y: 0.6, duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 1080 },
  { leave: true },
  { wait: 180 },
  { cue: 'again' },
  { wait: 420 },
];

function Exporting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%' }}>
      <div style={{ minBlockSize: formWithErrorOrResultHeight, inlineSize: 'min(100%, 16rem)' }}>
        <Renew round={round}>
          <div style={{ inlineSize: '100%' }}>
            <RequiredChoice />
          </div>
        </Renew>
      </div>
    </div>
  );
}

export default function RequiredChoiceMotion() {
  return (
    <MotionStage label="the missing choice asked for and made">
      <Exporting />
    </MotionStage>
  );
}
