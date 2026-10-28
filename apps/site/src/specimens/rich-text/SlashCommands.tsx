import { useState } from 'react';
import SlashCommands from '../../examples/rich-text/SlashCommands';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const document = '.ProseMirror';

/*
 * The pointer presses in the empty notes and types "/": the menu of blocks opens. The arrow keys
 * go down to Meeting agenda, the application's own command, and Enter inserts the agenda. Undo
 * takes it back to the "/", and again to nothing, and the notes are empty again, as they began. The
 * editor is drawn anew then, its history with it, unseen, as it looks the same.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: `${document} p`, x: 0.2, y: 0.5 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { type: '/', into: document },
  { wait: 900 },
  // Down past the seven blocks to the agenda, the last.
  ...Array.from({ length: 7 }, (): PointerStep[] => [
    { key: 'ArrowDown', on: document },
    { wait: 330 },
  ]).flat(),
  { wait: 900 },
  { key: 'Enter', on: document },
  { wait: 1700 },
  { keyDown: 'Control', on: document },
  { key: 'z', on: document },
  { wait: 900 },
  { key: 'z', on: document },
  { keyUp: 'Control', on: document },
  { wait: 500 },
  { leave: true },
  { blur: true },
  { wait: 400 },
  { cue: 'again' },
  { wait: 500 },
];

function Inserting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the editor and its open menu, so the menu fits in the stage from the start.
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '25.5rem',
      }}
    >
      <div style={{ inlineSize: 'min(100%, 28rem)' }}>
        <SlashCommands key={round} />
      </div>
    </div>
  );
}

/** The slash menu opened by typing /, and the meeting agenda inserted from it. */
export default function SlashCommandsMotion() {
  return (
    <MotionStage label="a block inserted from the slash menu">
      <Inserting />
    </MotionStage>
  );
}
