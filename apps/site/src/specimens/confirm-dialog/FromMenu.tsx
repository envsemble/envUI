import { useRef } from 'react';
import FromMenu from '../../examples/confirm-dialog/FromMenu';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const menuButton = '.env-icon-button';

/*
 * The pointer opens the project's menu and picks Delete project…: the menu closes and the dialog
 * opens. Cancel closes it, and focus returns to the menu's button, whose focus ring shows.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: menuButton, x: 0.55, y: 0.6 },
  { wait: 300 },
  { click: true },
  { wait: 500 },
  { to: '.env-menu-item', x: 0.35, y: 0.55, duration: 400 },
  { wait: 400 },
  { click: true },
  { wait: 1500 },
  { to: '.env-dialog-actions .env-button:first-child', x: 0.5, y: 0.6, duration: 550 },
  { wait: 350 },
  { click: true },
  { leave: true },
  { cue: 'returned' },
  { wait: 2000 },
  { cue: 'away' },
  { wait: 600 },
];

/**
 * What marks focus for the site's :focus-visible rules (KeyboardControl.ts): an animated figure is
 * inert, so the dialog can't return real focus to the menu's button, as it does outside one.
 */
const focusMark = 'data-catalogue-focus';

function Deleting() {
  const root = useRef<HTMLDivElement>(null);
  usePointer(script, {
    onCue: (cue) =>
      root.current?.querySelector(menuButton)?.toggleAttribute(focusMark, cue === 'returned'),
  });
  return (
    <div ref={root}>
      <FromMenu />
    </div>
  );
}

/** The project's menu, whose Delete project… opens the dialog, used by a pointer no one sees. */
export default function FromMenuMotion() {
  return (
    <MotionStage label="the dialog opening from a menu" height="18rem">
      <Deleting />
    </MotionStage>
  );
}
