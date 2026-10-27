import { useState } from 'react';
import Validation from '../../examples/text-field/Validation';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { PressedKeys } from '../../previews/PressedKeys';
import { Renew } from '../../previews/Renew';

const input = 'input[name="handle"]';

/*
 * The pointer types "Northwind Launch": no error while it types. Tab leaves the field, and the
 * error shows. The pointer comes back, selects the handle and writes it in lowercase: the error
 * goes as soon as the handle fits. Then the field starts anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: input, x: 0.5, y: 2.2 },
  { to: input, x: 0.5, y: 0.5, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 150 },
  { type: 'Northwind Launch', into: input, every: 95 },
  { wait: 450 },
  { cue: 'tab' },
  { key: 'Tab' },
  { blur: true },
  { wait: 1700 },
  // Back into the field: a drag across the handle selects it, and typing replaces it.
  { cue: 'none' },
  { to: input, x: 0.92, y: 0.5, duration: 450 },
  { wait: 150 },
  { press: true },
  { to: input, x: 0.01, y: 0.5, duration: 450 },
  { release: true },
  { wait: 350 },
  { type: 'northwind-launch', into: input, every: 95 },
  { wait: 400 },
  { cue: 'tab' },
  { key: 'Tab' },
  { blur: true },
  { leave: true },
  { wait: 1400 },
  { cue: 'renew' },
  { wait: 600 },
];

function Checking() {
  const [round, setRound] = useState(0);
  // The Tab key's cap, from its first press until the field starts anew.
  const [tabs, setTabs] = useState(0);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'tab') return setTabs((count) => count + 1);
      setTabs(0);
      if (cue === 'renew') setRound((count) => count + 1);
    },
  });
  return (
    <>
      <PressedKeys keys={tabs ? ['Tab'] : null} press={tabs} />
      {/* As tall as the field with its error, so the figure keeps its height. */}
      <div
        style={{
          display: 'grid',
          alignContent: 'start',
          inlineSize: '100%',
          minBlockSize: '9.5rem',
        }}
      >
        <Renew round={round}>
          <Validation />
        </Renew>
      </div>
    </>
  );
}

/** The handle checked as a pointer no one sees leaves the field, and its error gone once it fits. */
export default function ValidationMotion() {
  return (
    <MotionStage label="the error shown as the field is left, and gone once it fits">
      <Checking />
    </MotionStage>
  );
}
