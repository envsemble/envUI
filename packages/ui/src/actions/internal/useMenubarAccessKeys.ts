'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';
import '../../styles/Base.css';
import '../../styles/Menubar.css';

function pressedLetters(event: KeyboardEvent) {
  const letters: string[] = [];
  const typedCharacter = Array.from(event.key).length === 1 ? event.key : undefined;
  if (typedCharacter) letters.push(typedCharacter.toLowerCase());
  const physicalKey = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(event.code);
  const physicalKeyLetterWhateverTheLayoutTypes = physicalKey?.[1] ?? physicalKey?.[2];
  if (physicalKeyLetterWhateverTheLayoutTypes)
    letters.push(physicalKeyLetterWhateverTheLayoutTypes.toLowerCase());
  return letters;
}

function enabledTriggers(menubar: HTMLElement) {
  return Array.from(menubar.querySelectorAll<HTMLElement>('.env-menubar-trigger')).filter(
    (trigger) => !trigger.hasAttribute('data-disabled'),
  );
}

function enabledTriggerNamedBy(menubar: HTMLElement, event: KeyboardEvent) {
  const triggers = enabledTriggers(menubar);
  for (const letter of pressedLetters(event)) {
    const trigger = triggers.find((candidate) => candidate.dataset.accessKey === letter);
    if (trigger) return trigger;
  }
  return undefined;
}

function keyReaches(menubar: HTMLElement, event: KeyboardEvent) {
  const inertRegion = menubar.closest('[inert]');
  const pressedInsideInertRegion =
    event.target instanceof Node && inertRegion !== null && inertRegion.contains(event.target);
  return !inertRegion || pressedInsideInertRegion;
}

function menuOpen(menubar: HTMLElement) {
  return menubar.querySelector('.env-menubar-trigger[aria-expanded="true"]') !== null;
}

function openMenuAsArrowDownOnTriggerDoes(trigger: HTMLElement) {
  trigger.focus();
  trigger.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    }),
  );
}

interface MenubarAccessKeysOptions {
  root: RefObject<HTMLElement | null>;
  enabled: boolean;
  leave: () => void;
}

export function useMenubarAccessKeys({ root, enabled, leave }: MenubarAccessKeysOptions) {
  const [altHeld, setAltHeld] = useState(false);
  const [keyboardActivated, setKeyboardActivated] = useState(false);

  useEffect(() => {
    const menubar = root.current;
    if (!enabled || !menubar) return;
    const document = menubar.ownerDocument;
    const view = document.defaultView;
    if (!view) return;
    let altAlone = false;

    const activate = (trigger: HTMLElement) => {
      setKeyboardActivated(true);
      openMenuAsArrowDownOnTriggerDoes(trigger);
    };
    const exit = () => {
      setKeyboardActivated(false);
      leave();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!keyReaches(menubar, event)) return;
      if (event.key === 'Alt') {
        if (!event.repeat) altAlone = !event.ctrlKey && !event.metaKey && !event.shiftKey;
        if (altAlone) setAltHeld(true);
        return;
      }
      altAlone = false;
      setAltHeld(false);
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.altKey) {
        const trigger = enabledTriggerNamedBy(menubar, event);
        if (!trigger) return;
        event.preventDefault();
        activate(trigger);
        return;
      }
      const active = document.activeElement;
      const triggerFocusedWithNoMenuOpen =
        active instanceof HTMLElement && menubar.contains(active) && !menuOpen(menubar);
      if (!triggerFocusedWithNoMenuOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        exit();
        return;
      }
      const trigger = enabledTriggerNamedBy(menubar, event);
      if (!trigger) return;
      event.preventDefault();
      activate(trigger);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'Alt' || !keyReaches(menubar, event)) return;
      setAltHeld(false);
      if (!altAlone) return;
      altAlone = false;
      event.preventDefault();
      const active = document.activeElement;
      const inMenubar =
        active instanceof Element &&
        (menubar.contains(active) ||
          (menuOpen(menubar) && active.closest('[role="menu"]') !== null));
      if (inMenubar) {
        exit();
        return;
      }
      const first = enabledTriggers(menubar)[0];
      if (!first) return;
      setKeyboardActivated(true);
      first.focus();
    };
    const endHintAndKeyboardActivation = () => {
      altAlone = false;
      setAltHeld(false);
      setKeyboardActivated(false);
    };
    view.addEventListener('keydown', onKeyDown, true);
    view.addEventListener('keyup', onKeyUp, true);
    view.addEventListener('pointerdown', endHintAndKeyboardActivation, true);
    view.addEventListener('blur', endHintAndKeyboardActivation);
    return () => {
      view.removeEventListener('keydown', onKeyDown, true);
      view.removeEventListener('keyup', onKeyUp, true);
      view.removeEventListener('pointerdown', endHintAndKeyboardActivation, true);
      view.removeEventListener('blur', endHintAndKeyboardActivation);
      setAltHeld(false);
      setKeyboardActivated(false);
    };
  }, [root, enabled, leave]);

  const endActivation = useCallback(() => setKeyboardActivated(false), []);
  return { shown: enabled && (altHeld || keyboardActivated), endActivation };
}
