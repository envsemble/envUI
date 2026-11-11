import { useState } from 'react';
import ValidateOnBlur from '../../examples/field/ValidateOnBlur';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-field-control';

/*
 * The pointer types "Northwind Team" and tabs away: the check runs as the field loses focus, and
 * its error shows. It selects the text and types "northwind-team" over it, then tabs away again,
 * and the error goes. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: field, x: 0.3, y: 0.55 },
  { wait: 350 },
  { click: true },
  { type: 'Northwind Team', into: field, every: 110 },
  { wait: 400 },
  { key: 'Tab', on: field },
  { wait: 1500 },
  { to: field, x: 0.97, y: 0.55, duration: 500 },
  { wait: 200 },
  { press: true },
  { to: field, x: 0.01, y: 0.55, duration: 450 },
  { release: true },
  { wait: 350 },
  { type: 'northwind-team', into: field, every: 100 },
  { wait: 400 },
  { key: 'Tab', on: field },
  { wait: 1500 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Checking() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the field with its error, so it stays put as the error shows.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '8.4375rem',
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

/** A value checked as the field loses focus, typed and corrected by a pointer no one sees. */
export default function ValidateOnBlurMotion() {
  return (
    <MotionStage label="the value checked as the field loses focus">
      <Checking />
    </MotionStage>
  );
}
