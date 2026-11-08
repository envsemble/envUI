import { useState } from 'react';
import IconOnly from '../../examples/command-palette/IconOnly';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The pointer rests on the search icon in the header: its tooltip opens below it with the label and
 * the shortcut's keys. The pointer presses it, which opens search. The example is drawn anew at the
 * end, which clears its count of searches.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-icon-button', x: 0.55, y: 0.6 },
  { wait: 2000 },
  { click: true },
  { wait: 1200 },
  { leave: true },
  { wait: 1500 },
  { cue: 'again' },
  { wait: 300 },
];

function Searching() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the header and its count of searches, so the header stays put as that comes.
    <div style={{ inlineSize: 'min(100%, 24rem)', minBlockSize: '4.5rem' }}>
      <IconOnly key={round} />
    </div>
  );
}

/** The header's search icon, its tooltip shown and pressed by a pointer no one sees. */
export default function IconOnlyMotion() {
  return (
    <MotionStage label="the tooltip naming search and its keys" height="12rem">
      <Searching />
    </MotionStage>
  );
}
