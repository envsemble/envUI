import { useRef, useState, type KeyboardEvent } from 'react';
import { useModifierKey, type ModifierKey } from '@envsemble/envui';
import InSidebar from '../../examples/command-palette/InSidebar';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const input = '.env-command-palette-input';
/*
 * The pointer presses Search at the top of the sidebar: the palette opens, and Esc closes it.
 * Then Ctrl+K, ⌘K on Apple platforms, opens it again from the sidebar, and Esc closes it.
 */
const scriptFor = (modifier: ModifierKey['key']): PointerStep[] => [
  { wait: 500 },
  { to: '.env-navigation-drawer-header .env-button', x: 0.4, y: 0.6 },
  { wait: 400 },
  { click: true },
  // Off the palette, which opens over the sidebar, so no option shows the pointer's hover.
  { leave: true },
  { wait: 1400 },
  { cue: 'escape' },
  { key: 'Escape', on: input },
  { wait: 1300 },
  { cue: 'shortcut' },
  { keyDown: modifier, on: '.env-navigation-drawer' },
  { key: 'k', on: '.env-navigation-drawer' },
  { keyUp: modifier, on: '.env-navigation-drawer' },
  { wait: 1600 },
  { cue: 'escape' },
  { key: 'Escape', on: input },
  { wait: 1100 },
  { cue: 'none' },
  { wait: 300 },
];

function Opening() {
  const modifierKey = useModifierKey();
  const root = useRef<HTMLDivElement>(null);
  const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
  usePointer(scriptFor(modifierKey.key), {
    onCue: (cue) =>
      setPressed((last) =>
        cue === 'none'
          ? null
          : {
              keys: cue === 'escape' ? ['Esc'] : [modifierKey.label, 'K'],
              press: (last?.press ?? 0) + 1,
            },
      ),
  });
  // The application's shortcut, which it listens for at its root: here, in the figure alone, so
  // the page's own search shortcut neither hears it nor is taken from the reader.
  const onKeyDown = (event: KeyboardEvent) => {
    const held = modifierKey.key === 'Meta' ? event.metaKey : event.ctrlKey;
    if (!held || event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    event.stopPropagation();
    root.current
      ?.querySelector<HTMLButtonElement>('.env-navigation-drawer-header .env-button')
      ?.click();
  };
  return (
    <div ref={root} onKeyDown={onKeyDown}>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      <InSidebar />
    </div>
  );
}

/** The sidebar's Search, pressed, and the shortcut, each opening the palette. */
export default function InSidebarMotion() {
  return (
    <MotionStage label="the button and the shortcut opening the palette" height="20rem">
      <Opening />
    </MotionStage>
  );
}
