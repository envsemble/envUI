import { useState } from 'react';
import IconOnly from '../../examples/command-palette/IconOnly';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const headerWithCountHeight = '4.5rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-icon-button', x: 0.55, y: 0.6 },
  { wait: 1200 },
  { click: true },
  { wait: 720 },
  { leave: true },
  { wait: 900 },
  { cue: 'again' },
  { wait: 180 },
];

function Searching() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div style={{ inlineSize: 'min(100%, 24rem)', minBlockSize: headerWithCountHeight }}>
      <IconOnly key={round} />
    </div>
  );
}

export default function IconOnlyMotion() {
  return (
    <MotionStage label="the tooltip naming search and its keys" height="12rem">
      <Searching />
    </MotionStage>
  );
}
