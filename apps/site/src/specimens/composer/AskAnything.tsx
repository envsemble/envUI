import { useState } from 'react';
import AskAnything from '../../examples/composer/AskAnything';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const field = '.env-composer-input';

const untilTheReplyEndsMs = 4920;
const twoLineFieldWithNoteHeight = '7rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: field, x: 0.3, y: 0.5 },
  { wait: 180 },
  { click: true },
  { wait: 180 },
  {
    type: 'Can you summarise the pricing research and list the open questions?',
    into: field,
    every: 55,
  },
  { wait: 480 },
  { key: 'Enter', on: field },
  { wait: 180 },
  { leave: true },
  { wait: untilTheReplyEndsMs },
  { cue: 'again' },
  { wait: 180 },
];

function Asking() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: twoLineFieldWithNoteHeight,
      }}
    >
      <AskAnything key={round} />
    </div>
  );
}

export default function AskAnythingMotion() {
  return (
    <MotionStage label="the field growing, sending and the reply running">
      <Asking />
    </MotionStage>
  );
}
