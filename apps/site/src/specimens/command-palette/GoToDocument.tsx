import { useState } from 'react';
import GoToDocument from '../../examples/command-palette/GoToDocument';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const input = '.env-command-palette-input';

/*
 * The pointer presses Go to document: the palette opens on the documents opened last. It types
 * "road", which narrows the list to the roadmap, and Enter opens it, closing the palette. The
 * example is drawn anew at the end, which clears what it says it opened, as at the start.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  // Off the palette, which opens over where the button was, so no option shows the pointer's hover.
  { leave: true },
  { wait: 1300 },
  { type: 'road', into: input, every: 170 },
  { wait: 1300 },
  { key: 'Enter', on: input },
  { wait: 2200 },
  { cue: 'again' },
  { wait: 300 },
];

function Opening() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the button and what it says it opened, so the button stays put as that comes.
    <div style={{ minBlockSize: '4.5rem' }}>
      <GoToDocument key={round} />
    </div>
  );
}

/** The overview's palette, opened, searched and chosen from by a pointer no one sees. */
export default function GoToDocumentMotion() {
  return (
    <MotionStage label="the palette opening and finding a document" height="24rem">
      <Opening />
    </MotionStage>
  );
}
