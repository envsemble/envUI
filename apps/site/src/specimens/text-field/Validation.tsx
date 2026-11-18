import { useState } from 'react';
import Validation from '../../examples/text-field/Validation';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const input = 'input[name="handle"]';
const fieldWithErrorHeight = '9.5rem';

const script: PointerStep[] = [
  { wait: 720 },
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
  const [tabs, setTabs] = useState(0);
  usePointer(script, {
    onCue: (cue) => setTabs((count) => (cue === 'tab' ? count + 1 : 0)),
  });
  return (
    <>
      <PressedKeys keys={tabs ? ['Tab'] : null} press={tabs} />
      <div
        style={{
          display: 'grid',
          alignContent: 'start',
          justifyItems: 'center',
          inlineSize: '100%',
          minBlockSize: fieldWithErrorHeight,
        }}
      >
        <Validation />
      </div>
    </>
  );
}

export default function ValidationMotion() {
  return (
    <MotionStage label="the error shown as the field is left, and gone once it fits">
      <Checking />
    </MotionStage>
  );
}
