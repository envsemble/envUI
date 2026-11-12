import { useState } from 'react';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';

const trigger = '.env-icon-button';

/*
 * The do and the don't of a menu's order play one timeline, side by side, by keyboard alone: focus
 * comes to the menu's button, Enter opens the menu with its first item highlighted, a moment to see
 * which, and Esc closes it, focus back on the button. Their scripts are the same and move no pointer, so the two keep in
 * step.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { focus: trigger },
  { wait: 420 },
  { cue: 'enter' },
  { wait: 1440 },
  { cue: 'escape' },
  { key: 'Escape', on: '.env-menu' },
  { wait: 420 },
  { cue: 'still' },
  { wait: 240 },
];

/**
 * Plays the keyboard's timeline over the menu in `root`, and returns the keys pressed last, for
 * PressedKeys. Enter on a button is a click the browser makes, which a keydown sent to the button
 * doesn't make: the button is clicked as the browser would, with no pointer, which a menu opens
 * from with its first item highlighted.
 */
export function useOpenedByKeyboard(root: { current: HTMLElement | null }) {
  const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'enter')
        root.current
          ?.closest('.catalogue-motion-subject')
          ?.querySelector<HTMLElement>(trigger)
          ?.click();
      if (cue === 'still') setPressed(null);
      else
        setPressed((last) => ({
          keys: [cue === 'enter' ? 'Enter' : 'Esc'],
          press: (last?.press ?? 0) + 1,
        }));
    },
  });
  return pressed;
}
