import { useState } from 'react';
import ValidateOnBlur from '../../examples/field/ValidateOnBlur';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-field-control';

const fieldWithErrorHeight = '8.4375rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: field, x: 0.3, y: 0.55 },
  { wait: 210 },
  { click: true },
  { type: 'Northwind Team', into: field, every: 110 },
  { wait: 240 },
  { key: 'Tab', on: field },
  { wait: 900 },
  { to: field, x: 0.97, y: 0.55, duration: 500 },
  { wait: 120 },
  { press: true },
  { to: field, x: 0.01, y: 0.55, duration: 450 },
  { release: true },
  { wait: 210 },
  { type: 'northwind-team', into: field, every: 100 },
  { wait: 240 },
  { key: 'Tab', on: field },
  { wait: 900 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Checking() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: fieldWithErrorHeight,
      }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: 'min(100%, 24rem)' }}>
          <ValidateOnBlur />
        </div>
      </Renew>
    </div>
  );
}

export default function ValidateOnBlurMotion() {
  return (
    <MotionStage label="the value checked as the field loses focus">
      <Checking />
    </MotionStage>
  );
}
