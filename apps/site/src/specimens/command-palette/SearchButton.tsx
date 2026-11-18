import { useRef, useState, type KeyboardEvent } from 'react';
import { useModifierKey, type ModifierKey } from '@envsemble/envui';
import SearchButton from '../../examples/command-palette/SearchButton';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const input = '.env-command-palette-input';

const scriptFor = (modifier: ModifierKey['key']): PointerStep[] => [
  { wait: 300 },
  { to: '.env-button', x: 0.4, y: 0.6 },
  { wait: 240 },
  { click: true },
  { leave: true },
  { wait: 840 },
  { cue: 'escape' },
  { key: 'Escape', on: input },
  { wait: 780 },
  { cue: 'shortcut' },
  { keyDown: modifier, on: '.env-button' },
  { key: 'k', on: '.env-button' },
  { keyUp: modifier, on: '.env-button' },
  { wait: 960 },
  { cue: 'escape' },
  { key: 'Escape', on: input },
  { wait: 660 },
  { cue: 'none' },
  { wait: 180 },
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
  const handleShortcutWithinFigure = (event: KeyboardEvent) => {
    const held = modifierKey.key === 'Meta' ? event.metaKey : event.ctrlKey;
    if (!held || event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    event.stopPropagation();
    root.current?.querySelector<HTMLButtonElement>('.env-button')?.click();
  };
  return (
    <div ref={root} onKeyDown={handleShortcutWithinFigure}>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      <SearchButton />
    </div>
  );
}

export default function SearchButtonMotion() {
  return (
    <MotionStage label="the button and the shortcut opening the palette" height="20rem">
      <Opening />
    </MotionStage>
  );
}
