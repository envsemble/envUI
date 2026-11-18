import { useState } from 'react';
import TextareaSizing from '../../examples/text-field/TextareaSizing';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const edge = '.env-textarea-resize-handle';
const reply = 'textarea[name="reply"]';
const room = '[data-catalogue-sizing-room]';
const bothFieldsGrownHeight = '16rem';

const script: PointerStep[] = [
  { wait: 240 },
  { to: edge, x: 0.5, y: 2.5 },
  { to: edge, x: 0.5, y: 0.5, duration: 450 },
  { wait: 180 },
  { press: true },
  { to: room, x: 0.5, y: 0.645, duration: 800 },
  { wait: 90 },
  { release: true },
  { wait: 360 },
  { to: reply, x: 0.4, y: 0.5, duration: 500 },
  { wait: 90 },
  { click: true },
  { wait: 150 },
  { type: 'Thanks, Sam.\n', into: reply, every: 80 },
  { type: 'Tuesday works for the review.\n', into: reply, every: 70 },
  { type: 'I’ll bring the budget.', into: reply, every: 70 },
  { wait: 300 },
  { blur: true },
  { leave: true },
  { wait: 840 },
  { cue: 'renew' },
  { wait: 360 },
];

function Sizing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      data-catalogue-sizing-room=""
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        blockSize: bothFieldsGrownHeight,
      }}
    >
      <Renew round={round}>
        <TextareaSizing />
      </Renew>
    </div>
  );
}

export default function TextareaSizingMotion() {
  return (
    <MotionStage label="a text area resized, and another growing with its text">
      <Sizing />
    </MotionStage>
  );
}
