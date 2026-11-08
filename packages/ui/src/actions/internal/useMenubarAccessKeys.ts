'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';
import '../../styles/Base.css';
import '../../styles/Menubar.css';

/** The letters a key event may stand for: the character typed and the letter key's own name. */
function pressedLetters(event: KeyboardEvent) {
  const letters: string[] = [];
  if (Array.from(event.key).length === 1) letters.push(event.key.toLowerCase());
  // With Alt, some keyboard layouts type another character; the physical key still names a letter.
  const code = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(event.code);
  const letter = code?.[1] ?? code?.[2];
  if (letter) letters.push(letter.toLowerCase());
  return letters;
}

function enabledTriggers(menubar: HTMLElement) {
  return Array.from(menubar.querySelectorAll<HTMLElement>('.env-menubar-trigger')).filter(
    (trigger) => !trigger.hasAttribute('data-disabled'),
  );
}

/** The enabled trigger whose access key the event names, if any. */
function triggerFor(menubar: HTMLElement, event: KeyboardEvent) {
  const triggers = enabledTriggers(menubar);
  for (const letter of pressedLetters(event)) {
    const trigger = triggers.find((candidate) => candidate.dataset.accessKey === letter);
    if (trigger) return trigger;
  }
  return undefined;
}

/**
 * A menubar in an inert region, such as the page behind a modal dialog, can't be used, so keys
 * pressed outside that region don't reach it; keys from inside it, as a script may send them, do.
 */
function reaches(menubar: HTMLElement, event: KeyboardEvent) {
  const region = menubar.closest('[inert]');
  return !region || (event.target instanceof Node && region.contains(event.target));
}

function menuOpen(menubar: HTMLElement) {
  return menubar.querySelector('.env-menubar-trigger[aria-expanded="true"]') !== null;
}

/** Opens a menu as ↓ on its trigger does, with focus on its first item. */
function openMenu(trigger: HTMLElement) {
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
  /** The menubar's root element. */
  root: RefObject<HTMLElement | null>;
  /** Whether access keys are on. */
  enabled: boolean;
  /** Leaves the menubar: closes an open menu and returns focus to where it was. Keep it stable. */
  leave: () => void;
}

/**
 * A menubar's desktop access keys: holding Alt alone shows them, Alt with a menu's letter opens that
 * menu, and Alt alone moves focus to the menubar and back. While a trigger has focus and no menu is
 * open, the letter alone opens a menu and Escape leaves. Returns whether the access keys show, and
 * a function that ends the keyboard activation, for when focus moves elsewhere.
 */
export function useMenubarAccessKeys({ root, enabled, leave }: MenubarAccessKeysOptions) {
  const [altHeld, setAltHeld] = useState(false);
  // Activation by the keyboard keeps the access keys visible while focus stays in the menubar.
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const menubar = root.current;
    if (!enabled || !menubar) return;
    const document = menubar.ownerDocument;
    const view = document.defaultView;
    if (!view) return;
    let altAlone = false;

    const activate = (trigger: HTMLElement) => {
      setActivated(true);
      openMenu(trigger);
    };
    const exit = () => {
      setActivated(false);
      leave();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!reaches(menubar, event)) return;
      if (event.key === 'Alt') {
        if (!event.repeat) altAlone = !event.ctrlKey && !event.metaKey && !event.shiftKey;
        if (altAlone) setAltHeld(true);
        return;
      }
      // Another key ends the hint, such as Space opening the window's own menu, which may keep the
      // Alt release from the page. An access key that opens a menu shows the keys again below.
      altAlone = false;
      setAltHeld(false);
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.altKey) {
        // Alt with a letter that no menu claims stays with the page.
        const trigger = triggerFor(menubar, event);
        if (!trigger) return;
        event.preventDefault();
        activate(trigger);
        return;
      }
      // While a trigger has focus and no menu is open, Escape leaves the menubar and a menu's
      // letter opens that menu.
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !menubar.contains(active) || menuOpen(menubar))
        return;
      if (event.key === 'Escape') {
        event.preventDefault();
        exit();
        return;
      }
      const trigger = triggerFor(menubar, event);
      if (!trigger) return;
      event.preventDefault();
      activate(trigger);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'Alt' || !reaches(menubar, event)) return;
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
      setActivated(true);
      first.focus();
    };
    // Leaving the window, or pointing, ends the hint and the keyboard activation.
    const cancel = () => {
      altAlone = false;
      setAltHeld(false);
      setActivated(false);
    };
    view.addEventListener('keydown', onKeyDown, true);
    view.addEventListener('keyup', onKeyUp, true);
    view.addEventListener('pointerdown', cancel, true);
    view.addEventListener('blur', cancel);
    return () => {
      view.removeEventListener('keydown', onKeyDown, true);
      view.removeEventListener('keyup', onKeyUp, true);
      view.removeEventListener('pointerdown', cancel, true);
      view.removeEventListener('blur', cancel);
      setAltHeld(false);
      setActivated(false);
    };
  }, [root, enabled, leave]);

  const endActivation = useCallback(() => setActivated(false), []);
  return { shown: enabled && (altHeld || activated), endActivation };
}
