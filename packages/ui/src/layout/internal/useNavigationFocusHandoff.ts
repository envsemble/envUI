'use client';

import { useEffect } from 'react';
import { entryOf, focusRegion, showing } from './scaffoldFocus.js';

/**
 * When the Scaffold's width changes the form that shows, focus in the form that hid goes to the
 * form that shows now, on its current item. Focus elsewhere stays where it is.
 */
export function useNavigationFocusHandoff(
  root: HTMLDivElement | null,
  hasNavigation: boolean,
  navigationId: string,
) {
  useEffect(() => {
    if (!root || !hasNavigation) return;
    const document = root.ownerDocument;
    const region = () => document.getElementById(navigationId);
    // The slot of the form that last had focus, until focus or a press goes elsewhere.
    let focused: HTMLElement | null = null;
    const slotOf = (node: EventTarget | null) => {
      const slot =
        node instanceof Element ? node.closest<HTMLElement>('[data-navigation-form]') : null;
      return slot && slot.parentElement === region() ? slot : null;
    };
    const onFocusIn = (event: FocusEvent) => {
      focused = slotOf(event.target);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !focused?.contains(event.target)) focused = null;
    };
    const observer = new ResizeObserver(() => {
      if (!focused || showing(focused)) return;
      const active = document.activeElement;
      // Focus that moved on, rather than left with the form as it hid, stays where it is.
      if (active && active !== document.body && !focused.contains(active)) {
        focused = null;
        return;
      }
      const next = [...(region()?.children ?? [])].find(
        (slot): slot is HTMLElement => slot instanceof HTMLElement && showing(slot),
      );
      focused = next ?? null;
      if (!next) return;
      const entry = entryOf(next);
      if (entry) entry.focus();
      else focusRegion(next);
    });
    root.addEventListener('focusin', onFocusIn);
    document.addEventListener('pointerdown', onPointerDown, true);
    observer.observe(root);
    return () => {
      root.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('pointerdown', onPointerDown, true);
      observer.disconnect();
    };
  }, [root, hasNavigation, navigationId]);
}
