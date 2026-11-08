import { useLayoutEffect, useRef, useState } from 'react';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';

/*
 * The do and the don't of a ConfirmDialog's tone play one timeline, side by side, by keyboard
 * alone: focus is on Delete draft, Enter opens the dialog and focus lands where the dialog starts
 * it, a moment to see where, then Esc closes it and focus is back on Delete draft, as it began.
 * Their scripts are the same, and press no button, so the two stay in step.
 */
const script: PointerStep[] = [
  { wait: 1000 },
  { cue: 'enter' },
  { wait: 150 },
  { cue: 'landed' },
  { wait: 2600 },
  { cue: 'escape' },
  { key: 'Escape', on: '.env-dialog' },
  { wait: 150 },
  { cue: 'back' },
  { wait: 1500 },
  { cue: 'still' },
  { wait: 500 },
];

/**
 * What marks focus for the site's :focus-visible rules (KeyboardControl.ts): an animated figure is
 * inert, so the dialog can't take real focus there, as it does outside one.
 */
const focusMark = 'data-catalogue-focus';

/**
 * Plays the keyboard's timeline over the dialog and its trigger in `root`, and returns the keys
 * pressed last, for PressedKeys. Focus lands where ConfirmDialog starts it outside a figure: on
 * Cancel in the danger tone, so a hurried Enter doesn't confirm, and on the confirm button in the
 * neutral one.
 */
export function useKeyboardOpening(root: { current: HTMLElement | null }) {
  const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
  const [focused, setFocused] = useState<'trigger' | 'dialog'>('trigger');
  const subject = () => root.current?.closest('.catalogue-motion-subject') ?? null;
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'enter') {
        setPressed((last) => ({ keys: ['Enter'], press: (last?.press ?? 0) + 1 }));
        subject()?.querySelector<HTMLElement>('.env-button')?.click();
      } else if (cue === 'landed') setFocused('dialog');
      else if (cue === 'escape')
        setPressed((last) => ({ keys: ['Esc'], press: (last?.press ?? 0) + 1 }));
      else if (cue === 'back') setFocused('trigger');
      else setPressed(null);
    },
  });
  const marked = useRef<Element | null>(null);
  useLayoutEffect(() => {
    const scope = subject();
    const popup = scope?.querySelector<HTMLElement>('.env-dialog');
    const target =
      focused === 'trigger'
        ? scope?.querySelector('.env-button')
        : popup?.querySelector(
            `.env-dialog-actions .env-button:${popup.dataset.tone === 'danger' ? 'first' : 'last'}-child`,
          );
    marked.current?.removeAttribute(focusMark);
    target?.setAttribute(focusMark, '');
    marked.current = target ?? null;
  });
  return pressed;
}
