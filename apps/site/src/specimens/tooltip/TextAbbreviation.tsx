import { useState } from 'react';
import TextAbbreviation from '../../examples/tooltip/TextAbbreviation';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

/*
 * The keyboard's focus arrives on CET: its tooltip opens at once. Focus leaves, and then the
 * pointer rests on CET: its tooltip opens after a moment, and closes as the pointer leaves.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { cue: 'tab' },
  { focus: 'abbr' },
  { wait: 1140 },
  { blur: true },
  { cue: 'none' },
  { wait: 540 },
  { to: 'abbr', x: 0.5, y: 2.6 },
  { to: 'abbr', x: 0.5, y: 0.6, duration: 450 },
  { wait: 1200 },
  { to: 'abbr', x: 0.5, y: 2.6, duration: 400 },
  { leave: true },
  { wait: 600 },
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
