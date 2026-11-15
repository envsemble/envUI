import { useState } from 'react';
import RunCommand from '../../examples/command-palette/RunCommand';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const input = '.env-command-palette-input';

const paletteListAboveButtonHeight = roomFor(23, 24, 30);

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 240 },
  { click: true },
  { leave: true },
  { wait: 660 },
  { cue: '↓' },
  { key: 'ArrowDown', on: input },
  { wait: 390 },
  { cue: '↓' },
  { key: 'ArrowDown', on: input },
  { wait: 390 },
  { cue: '↓' },
  { key: 'ArrowDown', on: input },
  { wait: 390 },
  { cue: '↑' },
  { key: 'ArrowUp', on: input },
  { wait: 540 },
  { cue: 'Enter' },
  { key: 'Enter', on: input },
  { wait: 840 },
  { cue: 'none' },
  { wait: 480 },
  { cue: 'again' },
  { wait: 180 },
];

function Running() {
  const [round, setRound] = useState(0);
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
    <div
      style={{ display: 'grid', alignContent: 'end', minBlockSize: paletteListAboveButtonHeight }}
    >
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} beside={input} />
      <RunCommand key={round} />
    </div>
  );
}

export default function RunCommandMotion() {
  return (
    <MotionStage label="the arrow keys moving through the commands" height="27rem">
      <Running />
    </MotionStage>
  );
}
