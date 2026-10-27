import { useState } from 'react';
import TextAbbreviation from '../../examples/tooltip/TextAbbreviation';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { PressedKeys } from '../../previews/PressedKeys';

/*
 * The keyboard's focus arrives on CET: its tooltip opens at once. Focus leaves, and then the
 * pointer rests on CET: its tooltip opens after a moment, and closes as the pointer leaves.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { cue: 'tab' },
  { focus: 'abbr' },
  { wait: 1900 },
  { blur: true },
  { cue: 'none' },
  { wait: 900 },
  { to: 'abbr', x: 0.5, y: 2.6 },
  { to: 'abbr', x: 0.5, y: 0.6, duration: 450 },
  { wait: 2000 },
  { to: 'abbr', x: 0.5, y: 2.6, duration: 400 },
  { leave: true },
  { wait: 1000 },
];

function Reading() {
  const [tabs, setTabs] = useState(0);
  usePointer(script, { onCue: (cue) => setTabs((count) => (cue === 'tab' ? count + 1 : 0)) });
  return (
    <>
      <PressedKeys keys={tabs ? ['Tab'] : null} press={tabs} />
      {/* Room above the text for the tooltip, so the figure keeps its height. */}
      <div
        style={{
          display: 'grid',
          justifyItems: 'center',
          alignContent: 'end',
          inlineSize: '100%',
          blockSize: '5rem',
        }}
      >
        <TextAbbreviation />
      </div>
    </>
  );
}

/** An abbreviation's tooltip, opened by keyboard focus and then by a pointer no one sees. */
export default function TextAbbreviationMotion() {
  return (
    <MotionStage label="the tooltip opened by focus and by the pointer">
      <Reading />
    </MotionStage>
  );
}
