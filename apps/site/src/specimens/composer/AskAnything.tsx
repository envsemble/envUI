import { useState } from 'react';
import AskAnything from '../../examples/composer/AskAnything';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const field = '.env-composer-input';

/*
 * The pointer clicks into the empty field and types a question, which grows the field by a line.
 * Enter sends it: the field empties, and the send button becomes a stop button while the reply
 * runs, then turns back. The example is drawn anew at the end, which clears what it says it sent.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: field, x: 0.3, y: 0.5 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  {
    type: 'Can you summarise the pricing research and list the open questions?',
    into: field,
    every: 55,
  },
  { wait: 800 },
  { key: 'Enter', on: field },
  { wait: 300 },
  { leave: true },
  // The reply runs for 4 s.
  { wait: 8200 },
  { cue: 'again' },
  { wait: 300 },
];

function Asking() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the field at two lines and what it says below it, the field at its top, so the
    // field grows down and nothing else moves.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '7rem',
      }}
    >
      <AskAnything key={round} />
    </div>
  );
}

/** The overview's composer, typed into and sent from by a pointer no one sees. */
export default function AskAnythingMotion() {
  return (
    <MotionStage label="the field growing, sending and the reply running">
      <Asking />
    </MotionStage>
  );
}
