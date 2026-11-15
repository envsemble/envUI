import { useState } from 'react';
import SearchInToolbar from '../../examples/text-field/SearchInToolbar';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const input = 'input[type="search"]';

const script: PointerStep[] = [
  { wait: 240 },
  { to: input, x: 0.5, y: 2.4 },
  { to: input, x: 0.35, y: 0.5, duration: 500 },
  { wait: 420 },
  { click: true },
  { wait: 300 },
  { type: 'Roadmap', into: input, every: 110 },
  { wait: 540 },
  { cue: 'escape' },
  { key: 'Escape' },
  { wait: 420 },
  { blur: true },
  { to: input, x: 0.5, y: 2.4, duration: 500 },
  { cue: 'none' },
  { leave: true },
  { wait: 540 },
];

function Searching() {
  const [escapes, setEscapes] = useState(0);
  usePointer(script, {
    onCue: (cue) => setEscapes((count) => (cue === 'escape' ? count + 1 : 0)),
  });
  return (
    <>
      <PressedKeys keys={escapes ? ['Esc'] : null} press={escapes} />
      <SearchInToolbar />
    </>
  );
}

export default function SearchInToolbarMotion() {
  return (
    <MotionStage label="the ghost search filling as it is used">
      <Searching />
    </MotionStage>
  );
}
