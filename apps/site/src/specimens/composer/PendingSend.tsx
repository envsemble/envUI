import { useState } from 'react';
import PendingSend from '../../examples/composer/PendingSend';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const field = '.env-composer-input';

/*
 * The pointer clicks into the field, types a reply and sends it with Enter. While the send is in
 * progress, the field stays editable and keeps focus: it types the next reply, which it sends once
 * the first has gone. The example is drawn anew at the end, which clears its count of replies.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: field, x: 0.3, y: 0.5 },
  { wait: 300 },
  { click: true },
  { wait: 250 },
  { type: 'Looks good to me.', into: field, every: 60 },
  { wait: 450 },
  { key: 'Enter', on: field },
  { leave: true },
  // The send takes 1.5 s; the next reply is typed meanwhile.
  { wait: 400 },
  { type: 'Can we move the review to Friday?', into: field, every: 60 },
  { wait: 1200 },
  { key: 'Enter', on: field },
  { wait: 4200 },
  { cue: 'again' },
  { wait: 300 },
];

function Replying() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the composer and its count of replies, so nothing moves as that comes.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '7rem',
      }}
    >
      <PendingSend key={round} />
    </div>
  );
}

/** A reply sent, and the next typed while it is sending, by a pointer no one sees. */
export default function PendingSendMotion() {
  return (
    <MotionStage label="the field staying editable while a reply sends">
      <Replying />
    </MotionStage>
  );
}
