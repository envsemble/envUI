import { useState } from 'react';
import RunCommand from '../../examples/command-palette/RunCommand';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage, roomFor } from '../../motion/MotionStage';

const input = '.env-command-palette-input';

/*
 * The pointer presses Run a command: the palette opens on the commands, with their shortcuts and a
 * badge. The arrow keys move the highlight down to Switch theme, and Enter runs it, closing the
 * palette. The example is drawn anew at the end, which clears what it says it ran.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  // Off the palette, which opens over where the button was, so no option shows the pointer's hover.
  { leave: true },
  { wait: 1100 },
  { key: 'ArrowDown', on: input },
  { wait: 650 },
  { key: 'ArrowDown', on: input },
  { wait: 650 },
  { key: 'ArrowDown', on: input },
  { wait: 650 },
  { key: 'ArrowUp', on: input },
  { wait: 900 },
  { key: 'Enter', on: input },
  { wait: 2200 },
  { cue: 'again' },
  { wait: 300 },
];

function Running() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the button and what it says it ran, so the button stays put as that comes; on a
    // narrow stage, where the commands wrap, as tall as the palette's whole list.
    <div style={{ minBlockSize: roomFor(4.5, 24, 30) }}>
      <RunCommand key={round} />
    </div>
  );
}

/** The commands, opened, moved through with the arrow keys and run by a pointer no one sees. */
export default function RunCommandMotion() {
  return (
    <MotionStage label="the arrow keys moving through the commands" height="27rem">
      <Running />
    </MotionStage>
  );
}
