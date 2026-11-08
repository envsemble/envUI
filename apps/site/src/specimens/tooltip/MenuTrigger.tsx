import { useState } from 'react';
import MenuTrigger from '../../examples/tooltip/MenuTrigger';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const more = '.env-icon-button[aria-label="More actions"]';

/*
 * The pointer rests on More actions: its tooltip names it. It presses the button, and the menu
 * opens with the tooltip closed, as long as the menu is open. Esc closes the menu.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: more, x: 0.5, y: 2.4 },
  { to: more, x: 0.5, y: 0.55, duration: 450 },
  { wait: 1800 },
  { click: true },
  { wait: 1700 },
  { cue: 'escape' },
  { key: 'Escape', on: '.env-menu' },
  { leave: true },
  { wait: 1200 },
  { cue: 'none' },
  { wait: 300 },
];

function Opening() {
  const [escapes, setEscapes] = useState(0);
  usePointer(script, {
    onCue: (cue) => setEscapes((count) => (cue === 'escape' ? count + 1 : 0)),
  });
  return (
    <>
      <PressedKeys keys={escapes ? ['Esc'] : null} press={escapes} />
      {/* The button in the middle of the room its tooltip opens into above and its menu below. */}
      <div
        style={{
          display: 'grid',
          justifyItems: 'center',
          alignContent: 'start',
          inlineSize: '100%',
          blockSize: '12rem',
          paddingBlockStart: '3rem',
        }}
      >
        <MenuTrigger />
      </div>
    </>
  );
}

/** A menu's button, named by its tooltip, and pressed by a pointer no one sees. */
export default function MenuTriggerMotion() {
  return (
    <MotionStage label="the tooltip closed while the menu is open">
      <Opening />
    </MotionStage>
  );
}
