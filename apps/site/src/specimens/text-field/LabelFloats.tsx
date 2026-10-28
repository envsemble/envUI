import { useState } from 'react';
import { TextField } from '@envsemble/envui';
import { Example } from '../../figures/Example';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';
import { Renew } from '../../motion/Renew';

const input = 'input[name="project"]';

/*
 * The pointer presses the empty field: its label floats into the outline. It types a name, and
 * Tab leaves the field, the label staying in the outline above the value. Then the field starts
 * anew, empty.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: input, x: 0.5, y: 2.2 },
  { to: input, x: 0.45, y: 0.5, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 650 },
  { type: 'Northwind launch', into: input, every: 95 },
  { wait: 450 },
  { cue: 'tab' },
  { key: 'Tab' },
  { blur: true },
  { leave: true },
  { wait: 1700 },
  { cue: 'renew' },
  { wait: 700 },
];

function Focusing() {
  const [round, setRound] = useState(0);
  const [tabs, setTabs] = useState(0);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'tab') return setTabs((count) => count + 1);
      setTabs(0);
      setRound((count) => count + 1);
    },
  });
  return (
    <>
      <PressedKeys keys={tabs ? ['Tab'] : null} press={tabs} />
      <Renew round={round}>
        <TextField
          variant="floating"
          label="Project name"
          name="project"
          autoComplete="off"
          spellCheck={false}
          style={{ inlineSize: 'min(100%, 20rem)' }}
        />
      </Renew>
    </>
  );
}

/** One field, its label floating as a pointer no one sees presses it and types. */
export default function LabelFloats() {
  return (
    <Example size="wide">
      <MotionStage label="the label floating into the outline">
        <Focusing />
      </MotionStage>
    </Example>
  );
}
