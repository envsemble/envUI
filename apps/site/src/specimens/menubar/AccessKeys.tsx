import { useState } from 'react';
import NotesMenubar from '../../examples/menubar/NotesMenubar';
import { Example } from '../../figures/Example';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const note = 'textarea';

/*
 * In the note, Alt is held: the menubar underlines each menu's access key. Alt with E opens Edit,
 * its first item highlighted, and Esc closes it again.
 */
const script: PointerStep[] = [
  { wait: 600 },
  { cue: 'Alt' },
  { keyDown: 'Alt', on: note },
  { wait: 1100 },
  { cue: 'Alt E' },
  { key: 'e', on: note },
  { keyUp: 'Alt', on: note },
  { wait: 1600 },
  { cue: 'Esc' },
  { key: 'Escape', on: '.env-menu' },
  { wait: 900 },
  { cue: 'none' },
  { wait: 700 },
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

/** The notes menubar's access keys, shown while Alt is held, and Alt+E opening Edit. */
export default function AccessKeys() {
  return (
    <Example>
      <MotionStage label="access keys while Alt is held">
        <Holding />
      </MotionStage>
    </Example>
  );
}
