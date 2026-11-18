import { useState } from 'react';
import PressableAvatars from '../../examples/avatar/PressableAvatars';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const person = (index: number) =>
  `.env-avatar-group-item:nth-child(${index} of .env-avatar-group-item)`;

const pileWithLineBelowHeight = '4.75rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-avatar-group', x: 0.3, y: 0.6 },
  { wait: 540 },
  { to: person(2), x: 0.5, y: 0.55, duration: 400 },
  { wait: 420 },
  { click: true },
  { wait: 1080 },
  { leave: true },
  { wait: 720 },
  { cue: 'again' },
  { wait: 240 },
];

function Pressing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((value) => value + 1) });
  return (
    <div style={{ minBlockSize: pileWithLineBelowHeight }}>
      <PressableAvatars key={round} />
    </div>
  );
}

export default function PressableAvatarsMotion() {
  return (
    <MotionStage label="the pile spreading and a person pressed">
      <Pressing />
    </MotionStage>
  );
}
