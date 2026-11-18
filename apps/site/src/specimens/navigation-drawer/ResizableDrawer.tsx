import { useState } from 'react';
import ResizableDrawer from '../../examples/navigation-drawer/ResizableDrawer';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const stillTrackWidthRem = 18;
const handleHalfWidthRem = 0.375;
const track = '[data-resize-track]';
const at = (drawerWidthRem: number) => (drawerWidthRem - handleHalfWidthRem) / stillTrackWidthRem;
const install = '.env-navigation-drawer-item[href="/guide/install"]';

const script: PointerStep[] = [
  { wait: 300 },
  { to: track, x: at(17.5), y: 0.5 },
  { wait: 270 },
  { press: true },
  { to: track, x: at(15), y: 0.5, duration: 900 },
  { wait: 120 },
  { release: true },
  { wait: 180 },
  { to: install, x: 0.45, y: 0.55, duration: 600 },
  { wait: 1560 },
  { to: track, x: at(15), y: 0.5, duration: 600 },
  { wait: 180 },
  { press: true },
  { to: track, x: at(17.5), y: 0.5, duration: 800 },
  { wait: 120 },
  { release: true },
  { wait: 240 },
  { leave: true },
  { cue: 'renew' },
  { wait: 360 },
];

const storageKey = 'guide-drawer-width';

function forgetChosenWidth() {
  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch {
    return false;
  }
}

function Resizing() {
  const [round, setRound] = useState(0);
  usePointer(script, {
    onCue: () => {
      forgetChosenWidth();
      setRound((count) => count + 1);
    },
  });
  return (
    <div style={{ position: 'relative', inlineSize: `${stillTrackWidthRem}rem` }}>
      <div data-resize-track style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <Renew round={round}>
        <div style={{ justifySelf: 'start' }}>
          <ResizableDrawer />
        </div>
      </Renew>
    </div>
  );
}

export default function ResizableDrawerMotion() {
  return (
    <MotionStage label="the drawer resized by its edge" height="22rem" stage="shaded">
      <Resizing />
    </MotionStage>
  );
}
