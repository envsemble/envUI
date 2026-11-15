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
    let slotThatLastHadFocus: HTMLElement | null = null;
    const slotOf = (node: EventTarget | null) => {
      const slot =
        node instanceof Element ? node.closest<HTMLElement>('[data-navigation-form]') : null;
      return slot && slot.parentElement === region() ? slot : null;
    };
    const onFocusIn = (event: FocusEvent) => {
      slotThatLastHadFocus = slotOf(event.target);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !slotThatLastHadFocus?.contains(event.target))
        slotThatLastHadFocus = null;
    };
    const observer = new ResizeObserver(() => {
      if (!slotThatLastHadFocus || showing(slotThatLastHadFocus)) return;
      const active = document.activeElement;
      const focusMovedOnRatherThanHidingWithForm =
        active && active !== document.body && !slotThatLastHadFocus.contains(active);
      if (focusMovedOnRatherThanHidingWithForm) {
        slotThatLastHadFocus = null;
        return;
      }
      const next = [...(region()?.children ?? [])].find(
        (slot): slot is HTMLElement => slot instanceof HTMLElement && showing(slot),
      );
      slotThatLastHadFocus = next ?? null;
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
