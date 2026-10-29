import { useState } from 'react';
import TextareaSizing from '../../examples/text-field/TextareaSizing';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const edge = '.env-textarea-resize-handle';
const reply = 'textarea[name="reply"]';
// The room the fields grow into, which stays where it is as they grow: the pointer drags by it.
const room = '[data-catalogue-sizing-room]';

/*
 * The pointer drags Description's bottom edge down, and the text area grows to show more of its
 * plan. Then it writes a reply of three lines, and Reply grows with each. The fields start anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: edge, x: 0.5, y: 2.5 },
  { to: edge, x: 0.5, y: 0.5, duration: 450 },
  { wait: 300 },
  { press: true },
  { to: room, x: 0.5, y: 0.645, duration: 800 },
  { wait: 150 },
  { release: true },
  { wait: 600 },
  { to: reply, x: 0.4, y: 0.5, duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 250 },
  { type: 'Thanks, Sam.\n', into: reply, every: 80 },
  { type: 'Tuesday works for the review.\n', into: reply, every: 70 },
  { type: 'I’ll bring the budget.', into: reply, every: 70 },
  { wait: 500 },
  { blur: true },
  { leave: true },
  { wait: 1400 },
  { cue: 'renew' },
  { wait: 600 },
];

function Sizing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as both fields once grown, so the figure keeps its height.
    <div
      data-catalogue-sizing-room=""
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', blockSize: '16rem' }}
    >
      <Renew round={round}>
        <TextareaSizing />
      </Renew>
    </div>
  );
}

/** A text area resized by its edge, and another growing as a pointer no one sees writes in it. */
export default function TextareaSizingMotion() {
  return (
    <MotionStage label="a text area resized, and another growing with its text">
      <Sizing />
    </MotionStage>
  );
}
