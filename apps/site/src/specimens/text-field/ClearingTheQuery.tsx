import { useState } from 'react';
import { SearchField } from '@envsemble/envui';
import { Example } from '../../figures/Example';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const input = 'input[type="search"]';
const clear = 'button[aria-label="Clear search"]';

/*
 * The pointer types a name into the search, and Esc empties it. It types another, and the clear
 * button empties it again.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: input, x: 0.5, y: 2.2 },
  { to: input, x: 0.4, y: 0.5, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 250 },
  { type: 'Priya', into: input, every: 110 },
  { wait: 900 },
  { cue: 'escape' },
  { key: 'Escape' },
  { wait: 1000 },
  { cue: 'none' },
  { type: 'Sam Lee', into: input, every: 110 },
  { wait: 600 },
  { to: clear, duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 500 },
  { blur: true },
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
      <SearchField
        label="Search members"
        placeholder="Search by name or e-mail"
        style={{ inlineSize: 'min(100%, 20rem)' }}
      />
    </>
  );
}

/** A search, emptied by Esc and then by its clear button, by a pointer no one sees. */
export default function ClearingTheQuery() {
  return (
    <Example size="wide">
      <MotionStage label="Esc and the clear button emptying the search">
        <Searching />
      </MotionStage>
    </Example>
  );
}
