import { useState } from 'react';
import References from '../../examples/rich-text/References';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const document = '.ProseMirror';

/*
 * The pointer presses at the end of the comment and types " @pri": the suggestions open once the
 * lookup answers, and Enter inserts the reference to Priya Shah. Undo takes it back to the typed
 * text, and again to the comment as it began. The editor is drawn anew then, its history with it,
 * unseen, as it looks the same.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: `${document} p`, x: 0.97, y: 0.5 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { type: ' @pri', into: document, every: 160 },
  { wait: 2000 },
  { key: 'Enter', on: document },
  { wait: 1500 },
  { keyDown: 'Control', on: document },
  { key: 'z', on: document },
  { wait: 1400 },
  { key: 'z', on: document },
  { keyUp: 'Control', on: document },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
  { cue: 'again' },
  { wait: 500 },
];

function Mentioning() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the editor and its open suggestions, so they fit in the stage from the start.
    <div style={{ inlineSize: '100%', minBlockSize: '20rem' }}>
      <div style={{ inlineSize: 'min(100%, 28rem)', marginInline: 'auto' }}>
        <References key={round} />
      </div>
    </div>
  );
}

/** A reference typed with @, chosen from the suggestions, and undone. */
export default function ReferencesMotion() {
  return (
    <MotionStage label="a reference typed with @ and inserted">
      <Mentioning />
    </MotionStage>
  );
}
