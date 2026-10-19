'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FrameStore } from '../app-shell/FrameStore.js';
import type { SidebarSide } from '../app-shell/persistence.js';
import { isEditableTarget } from '../../internal/useShortcut.js';

export interface PeekOptions {
  /** The sidebar's element, which the pointer and focus enter: a new one after the drawer. */
  element: HTMLElement | null;
  side: SidebarSide;
  id: string;
  store: FrameStore;
  /** Collapsed, inline (not a drawer) and collapsible: a peek or a hold can show it. */
  active: boolean;
  /** Whether a rail opens on hover: offcanvas sidebars only open by their trigger. */
  hoverable: boolean;
  mode: 'hover-focus' | 'hover' | 'none';
  delay: number;
  closeOnNavigate: boolean;
}

/**
 * Popups opened from the sidebar, such as a menu: their trigger reports aria-expanded, or, for a
 * context menu, is open (data-popup-open) and has a popup. A tooltip, which sets data-popup-open
 * on its trigger too, doesn't count, nor do the sidebar's own trigger and tree rows.
 */
const popupSelector = (id: string) =>
  `[aria-expanded="true"]:not([aria-controls="${id}"]):not([role="treeitem"]):not([data-sidebar-trigger]), [data-popup-open][aria-haspopup]:not([aria-expanded]):not([data-sidebar-trigger])`;

/** Whether focus at an element shows from the keyboard, or is in a field that takes typing. */
function keyboardFocus(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (isEditableTarget(target)) return true;
  try {
    return target.matches(':focus-visible');
  } catch {
    return false;
  }
}

/**
 * How a collapsed sidebar shows expanded over the content: the pointer resting on it for `delay`
 * ms with no button down (mouse only; a press during the rest cancels), keyboard focus inside it
 * (`hover-focus`), and its popups, which freeze the state it had as they opened. Escape, an
 * outside press and a navigation inside it close a peek or a hold; collapsing under the pointer
 * keeps it a rail until the pointer leaves. Returns whether a popup holds the state.
 */
export function usePeek({
  element,
  side,
  id,
  store,
  active,
  hoverable,
  mode,
  delay,
  closeOnNavigate,
}: PeekOptions) {
  const hover = useRef(false);
  const focus = useRef(false);
  const inside = useRef(false);
  const suppressed = useRef(false);
  const popup = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [popupOpen, setPopupOpen] = useState(false);
  const latest = useRef({ store, active, hoverable, mode, delay, closeOnNavigate });
  latest.current = { store, active, hoverable, mode, delay, closeOnNavigate };

  const stopTimer = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
  };
  // A dismissal lets go of the pointer and focus that held the sidebar: it stays a rail until the
  // pointer leaves, and until focus moves again. It is taken in as soon as anything reads the
  // state, since focus leaving a removed element reports before the layout effects run.
  const seenDismissals = useRef(store.dismissals[side]);
  const takeDismissal = () => {
    const count = latest.current.store.dismissals[side];
    if (count === seenDismissals.current) return;
    seenDismissals.current = count;
    stopTimer();
    hover.current = false;
    focus.current = false;
    suppressed.current = inside.current;
  };
  const update = () => {
    takeDismissal();
    const current = latest.current;
    // A popup opened from the sidebar keeps the state it had until it closes.
    if (popup.current) return;
    current.store.setPeek(
      side,
      current.active && ((hover.current && !suppressed.current) || focus.current),
    );
  };

  const dismissals = store.dismissals[side];
  // takeDismissal reads the latest store; the count alone decides when it runs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(takeDismissal, [dismissals]);

  // Docked, or in a drawer, nothing peeks.
  useLayoutEffect(() => {
    if (active) return;
    stopTimer();
    hover.current = false;
    focus.current = false;
    store.setPeek(side, false);
    // Only the change of active matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const root = element;
    if (!root) return;
    const startRest = (event: PointerEvent) => {
      const current = latest.current;
      if (!current.active || !current.hoverable || current.mode === 'none') return;
      if (event.pointerType !== 'mouse' || event.buttons !== 0) return;
      if (hover.current || suppressed.current || timer.current !== undefined) return;
      timer.current = setTimeout(() => {
        timer.current = undefined;
        hover.current = true;
        update();
      }, current.delay);
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      inside.current = true;
      startRest(event);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && inside.current) startRest(event);
    };
    // A press during the rest cancels it, so a quick click on a rail icon reaches what it started on.
    const onDown = () => stopTimer();
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      inside.current = false;
      suppressed.current = false;
      stopTimer();
      hover.current = false;
      update();
    };
    const onFocusIn = (event: FocusEvent) => {
      const current = latest.current;
      if (!current.active) return;
      const peeking = current.store.sides[side].peek;
      // Focus keeps an open peek open; with hover-focus, keyboard focus also opens one.
      if (peeking || (current.mode === 'hover-focus' && keyboardFocus(event.target)))
        focus.current = true;
      update();
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (next && root.contains(next)) return;
      focus.current = false;
      update();
    };
    const onClick = (event: MouseEvent) => {
      const current = latest.current;
      if (!current.closeOnNavigate || !current.active) return;
      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!link || !root.contains(link)) return;
      const state = current.store.sides[side];
      if (state.peek || state.held) current.store.dismiss(side, 'navigate');
    };
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    root.addEventListener('click', onClick);
    return () => {
      stopTimer();
      // A removed element holds neither the pointer nor focus.
      hover.current = false;
      inside.current = false;
      suppressed.current = false;
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      root.removeEventListener('click', onClick);
    };
    // The handlers read the latest options; they attach once per element.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, side]);

  // Popups freeze the state; their closing lets the pointer and focus decide again.
  useEffect(() => {
    const root = element;
    if (!root || typeof MutationObserver === 'undefined') return;
    const read = () => {
      const open = root.querySelector(popupSelector(id)) !== null;
      if (open === popup.current) return;
      popup.current = open;
      setPopupOpen(open);
      if (!open) {
        // Focus that went back into the sidebar with the popup's closing doesn't count as new.
        const focused = root.ownerDocument.activeElement;
        if (!focused || !root.contains(focused)) focus.current = false;
        update();
      }
    };
    const observer = new MutationObserver(read);
    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-expanded', 'data-popup-open'],
    });
    read();
    return () => observer.disconnect();
    // update reads the latest options.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, id]);

  // Escape and a press outside close a peek or a hold; never while a popup holds the state.
  const shown = store.sides[side].peek || store.sides[side].held;
  useEffect(() => {
    const root = element;
    if (!shown || !root) return;
    const page = root.ownerDocument;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || popup.current) return;
      const target = event.target as Node | null;
      if (target && target !== page.body && !root.contains(target)) return;
      latest.current.store.dismiss(side, 'escape');
    };
    const onPointerDown = (event: PointerEvent) => {
      if (popup.current) return;
      const target = event.target as Element | null;
      if (!target || root.contains(target)) return;
      // The sidebar's own triggers decide for themselves.
      if (target.closest?.(`[aria-controls="${id}"]`)) return;
      latest.current.store.dismiss(side, 'outside-press');
    };
    page.addEventListener('keydown', onKeyDown);
    page.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      page.removeEventListener('keydown', onKeyDown);
      page.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [shown, element, side, id]);

  return popupOpen;
}
