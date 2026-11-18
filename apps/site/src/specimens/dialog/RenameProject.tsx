import { useState } from 'react';
import RenameProject from '../../examples/dialog/RenameProject';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-dialog input';

const untilTheNameSavesMs = 2100;
const longerNameWidth = '9rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 240 },
  { click: true },
  { wait: 480 },
  { to: field, x: 0.6, y: 0.62, duration: 600 },
  { wait: 90 },
  { click: true },
  { erase: 6, into: field, every: 90 },
  { wait: 120 },
  { type: 'website', into: field, every: 150 },
  { wait: 300 },
  { key: 'Enter', on: field },
  { wait: 240 },
  { to: '.env-dialog-actions .env-button:first-child', x: 0.5, y: 0.6, duration: 500 },
  { wait: untilTheNameSavesMs },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Renaming() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <div style={{ inlineSize: longerNameWidth }}>
        <RenameProject />
      </div>
    </Renew>
  );
}

export default function RenameProjectMotion() {
  return (
    <MotionStage label="the dialog waiting while the name saves" height="21rem">
      <Renaming />
    </MotionStage>
  );
}
