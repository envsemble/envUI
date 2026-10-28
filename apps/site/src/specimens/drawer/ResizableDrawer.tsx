import { useState } from 'react';
import ResizableDrawer from '../../examples/drawer/ResizableDrawer';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { Renew } from '../../previews/Renew';

/*
 * A frame 18 rem wide from the drawer's start, which keeps still while the drawer's edge moves:
 * the pointer aims at it. The handle is 0.75 rem wide, inside the drawer's end edge.
 */
const track = '[data-resize-track]';
const at = (width: number) => (width - 0.375) / 18;
const install = '.env-drawer-item[href="/guide/install"]';

/*
 * The pointer drags the drawer's end edge from 17.5 rem to its narrowest, 15 rem: labels that no
 * longer fit end in an ellipsis. It rests on Install the app on your devices, whose tooltip gives
 * it in full, then drags the edge back. The example keeps the width people choose for their next visit; the
 * figure forgets it as it starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: track, x: at(17.5), y: 0.5 },
  { wait: 450 },
  { press: true },
  { to: track, x: at(15), y: 0.5, duration: 900 },
  { wait: 200 },
  { release: true },
  { wait: 300 },
  { to: install, x: 0.45, y: 0.55, duration: 600 },
  { wait: 2600 },
  { to: track, x: at(15), y: 0.5, duration: 600 },
  { wait: 300 },
  { press: true },
  { to: track, x: at(17.5), y: 0.5, duration: 800 },
  { wait: 200 },
  { release: true },
  { wait: 400 },
  { leave: true },
  { cue: 'renew' },
  { wait: 600 },
];

const storageKey = 'guide-drawer-width';

function Resizing() {
  const [round, setRound] = useState(0);
  usePointer(script, {
    onCue: () => {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Storage is blocked: the example keeps its width only while the page is open.
      }
      setRound((count) => count + 1);
    },
  });
  return (
    <div style={{ position: 'relative', inlineSize: '18rem' }}>
      <div data-resize-track style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <Renew round={round}>
        <div style={{ justifySelf: 'start' }}>
          <ResizableDrawer />
        </div>
      </Renew>
    </div>
  );
}

/** A drawer resized by its end edge, by a pointer no one sees, its labels cut short as it narrows. */
export default function ResizableDrawerMotion() {
  return (
    <MotionStage label="the drawer resized by its edge" height="22rem" stage="shaded">
      <Resizing />
    </MotionStage>
  );
}
