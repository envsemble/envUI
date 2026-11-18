import { useState } from 'react';
import SlashCommands from '../../examples/rich-text/SlashCommands';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const document = '.ProseMirror';
const blocksAboveTheAgenda = 7;
const editorWithOpenMenuHeight = '25.5rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: `${document} p`, x: 0.2, y: 0.5 },
  { wait: 180 },
  { click: true },
  { wait: 180 },
  { type: '/', into: document },
  { wait: 540 },
  ...Array.from({ length: blocksAboveTheAgenda }, (): PointerStep[] => [
    { key: 'ArrowDown', on: document },
    { wait: 198 },
  ]).flat(),
  { wait: 540 },
  { key: 'Enter', on: document },
  { wait: 1020 },
  { keyDown: 'Control', on: document },
  { key: 'z', on: document },
  { wait: 540 },
  { key: 'z', on: document },
  { keyUp: 'Control', on: document },
  { wait: 300 },
  { leave: true },
  { blur: true },
  { wait: 240 },
  { cue: 'again' },
  { wait: 300 },
];

function Inserting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: editorWithOpenMenuHeight,
      }}
    >
      <div style={{ inlineSize: 'min(100%, 28rem)' }}>
        <SlashCommands key={round} />
      </div>
    </div>
  );
}

export default function SlashCommandsMotion() {
  return (
    <MotionStage label="a block inserted from the slash menu">
      <Inserting />
    </MotionStage>
  );
}
