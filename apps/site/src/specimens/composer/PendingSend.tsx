import { useState } from 'react';
import PendingSend from '../../examples/composer/PendingSend';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const field = '.env-composer-input';

/*
 * The pointer clicks into the field, types a reply and sends it with Enter. While the send is in
 * progress, the field stays editable and keeps focus: it types the next reply, which it sends once
 * the first has gone. The example is drawn anew at the end, which clears its count of replies.
 */
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
  // The send takes 1.5 s; the next reply is typed meanwhile.
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
