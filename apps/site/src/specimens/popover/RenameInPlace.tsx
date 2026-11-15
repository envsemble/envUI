import { useState } from 'react';
import RenameInPlace from '../../examples/popover/RenameInPlace';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-popover .env-text-field-input';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 420 },
  { to: field, x: 0.92, y: 0.6, duration: 600 },
  { wait: 120 },
  { click: true },
  { wait: 180 },
  { erase: 'plan.md'.length, into: field, every: 90 },
  { wait: 150 },
  { type: 'brief.md', into: field, every: 120 },
  { wait: 300 },
  { to: '.env-popover button[type="submit"]', duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 1080 },
  { leave: true },
  { wait: 180 },
  { cue: 'again' },
  { wait: 420 },
];

function Renaming() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%' }}>
      <div style={{ minBlockSize: '15rem' }}>
        <Renew round={round}>
          <RenameInPlace />
        </Renew>
      </div>
    </div>
  );
}

export default function RenameInPlaceMotion() {
  return (
    <MotionStage label="the document renamed in the popover">
      <Renaming />
    </MotionStage>
  );
}
