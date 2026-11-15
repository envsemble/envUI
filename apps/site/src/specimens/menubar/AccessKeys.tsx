import { useState } from 'react';
import NotesMenubar from '../../examples/menubar/NotesMenubar';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const note = 'textarea';

const script: PointerStep[] = [
  { wait: 360 },
  { cue: 'Alt' },
  { keyDown: 'Alt', on: note },
  { wait: 660 },
  { cue: 'Alt E' },
  { key: 'e', on: note },
  { keyUp: 'Alt', on: note },
  { wait: 960 },
  { cue: 'Esc' },
  { key: 'Escape', on: '.env-menu' },
  { wait: 540 },
  { cue: 'none' },
  { wait: 420 },
];

function Holding() {
  const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
  usePointer(script, {
    onCue: (cue) =>
      setPressed((last) =>
        cue === 'none' ? null : { keys: cue.split(' '), press: (last?.press ?? 0) + 1 },
      ),
  });
  return (
    <>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      <NotesMenubar />
    </>
  );
}

export default function AccessKeys() {
  return (
    <SpecimenFrame>
      <MotionStage label="access keys while Alt is held">
        <Holding />
      </MotionStage>
    </SpecimenFrame>
  );
}
