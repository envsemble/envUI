import { useState } from 'react';
import PendingSend from '../../examples/composer/PendingSend';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const field = '.env-composer-input';

const composerWithCountHeight = '7rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: field, x: 0.3, y: 0.5 },
  { wait: 180 },
  { click: true },
  { wait: 150 },
  { type: 'Looks good to me.', into: field, every: 60 },
  { wait: 270 },
  { key: 'Enter', on: field },
  { leave: true },
  { wait: 240 },
  { type: 'Can we move the review to Friday?', into: field, every: 60 },
  { wait: 720 },
  { key: 'Enter', on: field },
  { wait: 2520 },
  { cue: 'again' },
  { wait: 180 },
];

function Replying() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: composerWithCountHeight,
      }}
    >
      <PendingSend key={round} />
    </div>
  );
}

export default function PendingSendMotion() {
  return (
    <MotionStage label="the field staying editable while a reply sends">
      <Replying />
    </MotionStage>
  );
}
