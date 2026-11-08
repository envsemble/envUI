import { useState } from 'react';
import SearchInToolbar from '../../examples/text-field/SearchInToolbar';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const input = 'input[type="search"]';

/*
 * The pointer rests on the ghost search, and its fill shows. It clicks, the placeholder clears,
 * and it types a file's name. Esc empties the search, and the pointer leaves: the field is only its
 * icon and placeholder again.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: input, x: 0.5, y: 2.4 },
  { to: input, x: 0.35, y: 0.5, duration: 500 },
  { wait: 700 },
  { click: true },
  { wait: 500 },
  { type: 'Roadmap', into: input, every: 110 },
  { wait: 900 },
  { cue: 'escape' },
  { key: 'Escape' },
  { wait: 700 },
  { blur: true },
  { to: input, x: 0.5, y: 2.4, duration: 500 },
  { cue: 'none' },
  { leave: true },
  { wait: 900 },
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

/** A ghost search in a toolbar, filled under a pointer no one sees and while it types. */
export default function SearchInToolbarMotion() {
  return (
    <MotionStage label="the ghost search filling as it is used">
      <Searching />
    </MotionStage>
  );
}
