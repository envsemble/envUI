import { useRef } from 'react';
import FromMenu from '../../examples/confirm-dialog/FromMenu';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const menuButton = '.env-icon-button';

const script: PointerStep[] = [
  { wait: 300 },
  { to: menuButton, x: 0.55, y: 0.6 },
  { wait: 180 },
  { click: true },
  { wait: 300 },
  { to: '.env-menu-item', x: 0.35, y: 0.55, duration: 400 },
  { wait: 240 },
  { click: true },
  { wait: 900 },
  { to: '.env-dialog-actions .env-button:first-child', x: 0.5, y: 0.6, duration: 550 },
  { wait: 210 },
  { click: true },
  { leave: true },
  { cue: 'returned' },
  { wait: 1200 },
  { cue: 'away' },
  { wait: 360 },
];

const focusVisibleInInertFigure = 'data-catalogue-focus';

function Deleting() {
  const root = useRef<HTMLDivElement>(null);
  usePointer(script, {
    onCue: (cue) =>
      root.current
        ?.querySelector(menuButton)
        ?.toggleAttribute(focusVisibleInInertFigure, cue === 'returned'),
  });
  return (
    <div ref={root}>
      <FromMenu />
    </div>
  );
}

export default function FromMenuMotion() {
  return (
    <MotionStage label="the dialog opening from a menu" height="18rem">
      <Deleting />
    </MotionStage>
  );
}
