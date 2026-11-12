import { useState } from 'react';
import Validation from '../../examples/text-field/Validation';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const input = 'input[name="handle"]';

/*
 * The field starts as people left it, its handle in capitals and its error under it. The pointer
 * selects the handle and writes it in lowercase: the error goes as soon as the handle fits. Back
 * in the field, it writes the capitals again: no error while it types, and Tab leaving the field
 * brings it back, as it began.
 */
const script: PointerStep[] = [
  { wait: 720 },
  // A drag across the handle selects it, and typing replaces it.
  { to: input, x: 0.92, y: 0.5, duration: 500 },
  { wait: 90 },
  { press: true },
  { to: input, x: 0.01, y: 0.5, duration: 450 },
  { release: true },
  { wait: 210 },
  { type: 'northwind-launch', into: input, every: 95 },
  { wait: 240 },
  { cue: 'tab' },
  { key: 'Tab' },
  { blur: true },
  { wait: 840 },
  { cue: 'none' },
  { to: input, x: 0.92, y: 0.5, duration: 450 },
  { wait: 90 },
  { press: true },
  { to: input, x: 0.01, y: 0.5, duration: 450 },
  { release: true },
  { wait: 210 },
  { type: 'Northwind Launch', into: input, every: 95 },
  { wait: 270 },
  { cue: 'tab' },
  { key: 'Tab' },
  { blur: true },
  { leave: true },
  { wait: 840 },
  { cue: 'none' },
];

function Checking() {
  // The Tab key's cap, from its press until the pointer goes back into the field.
  const [tabs, setTabs] = useState(0);
  usePointer(script, {
    onCue: (cue) => setTabs((count) => (cue === 'tab' ? count + 1 : 0)),
  });
  return (
    <>
      <PressedKeys keys={tabs ? ['Tab'] : null} press={tabs} />
      {/* As tall as the field with its error, so the figure keeps its height; the field in the
          middle, clear of the key's cap in the corner. */}
      <div
        style={{
          display: 'grid',
          alignContent: 'start',
          justifyItems: 'center',
          inlineSize: '100%',
          minBlockSize: '9.5rem',
        }}
      >
        <Validation />
      </div>
    </>
  );
}

/** The handle's error gone once it fits, and back as a pointer no one sees leaves the field. */
export default function ValidationMotion() {
  return (
    <MotionStage label="the error shown as the field is left, and gone once it fits">
      <Checking />
    </MotionStage>
  );
}
