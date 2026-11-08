import { useState } from 'react';
import RunCommand from '../../examples/command-palette/RunCommand';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage, roomFor } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const input = '.env-command-palette-input';

/*
 * The pointer presses Run a command: the palette opens on the commands, with their shortcuts and a
 * badge. The arrow keys move the highlight down to Switch theme, and Enter runs it, closing the
 * palette; each key shows as a cap beside the palette's field as it is pressed. The example is
 * drawn anew at the end, which clears what it says it ran.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  // Off the palette, which opens over where the button was, so no option shows the pointer's hover.
  { leave: true },
  { wait: 1100 },
  { cue: '↓' },
  { key: 'ArrowDown', on: input },
  { wait: 650 },
  { cue: '↓' },
  { key: 'ArrowDown', on: input },
  { wait: 650 },
  { cue: '↓' },
  { key: 'ArrowDown', on: input },
  { wait: 650 },
  { cue: '↑' },
  { key: 'ArrowUp', on: input },
  { wait: 900 },
  { cue: 'Enter' },
  { key: 'Enter', on: input },
  { wait: 1400 },
  { cue: 'none' },
  { wait: 800 },
  { cue: 'again' },
  { wait: 300 },
];

function Running() {
  const [round, setRound] = useState(0);
  // The key just pressed, as a cap beside the field it goes to, since no pointer shows it.
  const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'again') setRound((count) => count + 1);
      else
        setPressed((last) =>
          cue === 'none' ? null : { keys: [cue], press: (last?.press ?? 0) + 1 },
        );
    },
  });
  return (
    // As tall as the palette's whole list, with the button and what it says it ran at its foot,
    // below where the palette opens, so the frosted panel never blurs the button behind it, and
    // the button stays put as what it ran comes.
    <div style={{ display: 'grid', alignContent: 'end', minBlockSize: roomFor(23, 24, 30) }}>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} beside={input} />
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
