import { useState } from 'react';
import MenuTrigger from '../../examples/tooltip/MenuTrigger';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const more = '.env-icon-button[aria-label="More actions"]';

const script: PointerStep[] = [
  { wait: 240 },
  { to: more, x: 0.5, y: 2.4 },
  { to: more, x: 0.5, y: 0.55, duration: 450 },
  { wait: 1080 },
  { click: true },
  { wait: 1020 },
  { cue: 'escape' },
  { key: 'Escape', on: '.env-menu' },
  { leave: true },
  { wait: 720 },
  { cue: 'none' },
  { wait: 180 },
];

function Opening() {
  const [escapes, setEscapes] = useState(0);
  usePointer(script, {
    onCue: (cue) => setEscapes((count) => (cue === 'escape' ? count + 1 : 0)),
  });
  return (
    <>
      <PressedKeys keys={escapes ? ['Esc'] : null} press={escapes} />
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

export default function MenuTriggerMotion() {
  return (
    <MotionStage label="the tooltip closed while the menu is open">
      <Opening />
    </MotionStage>
  );
}
