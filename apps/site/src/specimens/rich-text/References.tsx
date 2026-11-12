import { useState } from 'react';
import References from '../../examples/rich-text/References';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const document = '.ProseMirror';

/*
 * The pointer presses at the end of the comment and types " @pri": the suggestions open once the
 * lookup answers, and Enter inserts the reference to Priya Shah. Undo takes it back to the typed
 * text, and again to the comment as it began. The editor is drawn anew then, its history with it,
 * unseen, as it looks the same.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: `${document} p`, x: 0.97, y: 0.5 },
  { wait: 180 },
  { click: true },
  { wait: 180 },
  { type: ' @pri', into: document, every: 160 },
  { wait: 1200 },
  { key: 'Enter', on: document },
  { wait: 900 },
  { keyDown: 'Control', on: document },
  { key: 'z', on: document },
  { wait: 840 },
  { key: 'z', on: document },
  { keyUp: 'Control', on: document },
  { wait: 300 },
  { leave: true },
  { wait: 240 },
  { cue: 'again' },
  { wait: 300 },
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
