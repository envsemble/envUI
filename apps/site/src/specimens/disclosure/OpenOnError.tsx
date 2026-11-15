import { useState } from 'react';
import OpenOnError from '../../examples/disclosure/OpenOnError';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const formWithSettingsOpenHeight = '15.25rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button[type="submit"]', x: 0.55, y: 0.6 },
  { wait: 600 },
  { click: true },
  { wait: 1560 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Saving() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: formWithSettingsOpenHeight,
      }}
    >
      <Renew round={round}>
        <OpenOnError />
      </Renew>
    </div>
  );
}

export default function OpenOnErrorMotion() {
  return (
    <MotionStage label="the disclosure opening onto an error">
      <Saving />
    </MotionStage>
  );
}
