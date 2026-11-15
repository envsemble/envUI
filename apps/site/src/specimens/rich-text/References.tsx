import { useState } from 'react';
import References from '../../examples/rich-text/References';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const document = '.ProseMirror';

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

const editorWithOpenSuggestionsHeight = '20rem';

function Mentioning() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div style={{ inlineSize: '100%', minBlockSize: editorWithOpenSuggestionsHeight }}>
      <div style={{ inlineSize: 'min(100%, 28rem)', marginInline: 'auto' }}>
        <References key={round} />
      </div>
    </div>
  );
}

export default function ReferencesMotion() {
  return (
    <MotionStage label="a reference typed with @ and inserted">
      <Mentioning />
    </MotionStage>
  );
}
