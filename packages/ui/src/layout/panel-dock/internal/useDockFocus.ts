'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { PanelDockPanel } from '../panelDockTypes.js';
import {
  isShown,
  locateFocus,
  revealInContent,
  revealInWindow,
  type FocusedPanel,
  type Placement,
} from './dockLayout.js';

/**
 * What the dock knows of focus in its panels: where focus is before an update is committed, read
 * during render while a panel or tab that is about to hide or leave still holds it, the element in
 * each panel's content that last had focus, and a panel to focus once it shows. useDockFocus moves
 * focus with it once the update is committed.
 */
export function useFocusTracking(root: RefObject<HTMLElement | null>) {
  // The element in each panel's content that last had focus, where restoring the panel returns.
  const lastFocused = useRef(new Map<string, HTMLElement>());
  // The panel whose content holds focus, also in a popup it opened, such as a menu in a portal:
  // React's focus events reach the panel through portals. It holds the element that took focus, as
  // an element that leaves while it has focus fires no blur, and focus elsewhere is no longer the
  // panel's.
  const focusedPanel = useRef<FocusedPanel | null>(null);
  // A panel its tab asked to bring back, which takes focus once it shows.
  const pendingRestore = useRef<string | null>(null);
  const before = locateFocus(root.current, focusedPanel.current);

  return {
    root,
    before,
    /** The element in the panel's content that last had focus. */
    lastFocusedIn: (id: string) => lastFocused.current.get(id),
    /** Forgets the elements of panels no longer in the dock. */
    keepPanels: (ids: ReadonlySet<string>) => {
      for (const id of lastFocused.current.keys()) if (!ids.has(id)) lastFocused.current.delete(id);
    },
    /** The panel to focus once it shows, if any, which is then no longer pending. */
    takePendingRestore: () => {
      const id = pendingRestore.current;
      pendingRestore.current = null;
      return id;
    },
    /** The panel whose content holds focus now. */
    focusedId: () => {
      const focus = locateFocus(root.current, focusedPanel.current);
      return focus && !focus.tab ? focus.id : undefined;
    },
    /** Focus entered the panel's content, or a popup it opened, or left it, with null. */
    onFocusWithin: (id: string, element: EventTarget | null) => {
      if (element) focusedPanel.current = { id, element };
      else if (focusedPanel.current?.id === id) focusedPanel.current = null;
    },
    /** An element in the panel's content took focus. */
    onFocusContent: (id: string, target: HTMLElement) => lastFocused.current.set(id, target),
    /** The panel takes focus once it shows. */
    focusOnShow: (id: string) => {
      pendingRestore.current = id;
    },
  };
}

/**
 * Focus follows a panel's content: a panel that hides hands focus to its tab, a panel brought back
 * takes it again where it was, and a panel moved by a reorder keeps it. Call it after the dock's
 * other effects, which scroll the row to the panels that join it.
 */
export function useDockFocus<Panel extends PanelDockPanel>(
  tracking: ReturnType<typeof useFocusTracking>,
  {
    panels,
    placements,
    tabs,
    filling,
    frameOf,
    strip,
  }: {
    panels: readonly Panel[];
    placements: ReadonlyMap<string, Placement>;
    /** The panels behind their tabs. */
    tabs: readonly Panel[];
    /** The panel that fills the region. */
    filling: Panel | undefined;
    frameOf: (id: string) => HTMLElement | undefined;
    strip: RefObject<HTMLElement | null>;
  },
) {
  const { root, before: focusBefore, lastFocusedIn, keepPanels, takePendingRestore } = tracking;
  const previousTabs = useRef<readonly string[]>([]);

  function focusInto(id: string) {
    const frame = frameOf(id);
    if (!frame) return;
    const last = lastFocusedIn(id);
    if (last?.isConnected && frame.contains(last)) {
      last.focus({ preventScroll: true });
      if (last.ownerDocument.activeElement === last) {
        revealInWindow(frame.ownerDocument.defaultView, revealInContent(frame, last));
        return;
      }
    }
    frame.focus({ preventScroll: true });
    revealInWindow(frame.ownerDocument.defaultView, frame.getBoundingClientRect());
  }

  /**
   * Focuses a tab's button. A browser would scroll it into view as it likes, some to the middle of
   * the window; the page scrolls only where the tab lies entirely outside it, and as little as shows
   * it.
   */
  function focusTab(id: string | undefined) {
    const tab = [...(strip.current?.children ?? [])].find(
      (element) => element instanceof HTMLElement && element.dataset.panelId === id,
    );
    const button = tab?.querySelector<HTMLButtonElement>('.env-panel-dock-tab-restore');
    if (!button) return;
    button.focus({ preventScroll: true });
    revealInWindow(button.ownerDocument.defaultView, button.getBoundingClientRect());
  }

  /** Once the focused panel or tab leaves: the active or newest panel shown, or the last tab. */
  function focusRemaining() {
    const visible = panels.filter((panel) => placements.get(panel.id) !== 'hidden');
    const target =
      visible.find((panel) => panel.active) ??
      visible.filter((panel) => placements.get(panel.id) === 'row').at(-1) ??
      filling;
    if (target) focusInto(target.id);
    else focusTab(tabs.at(-1)?.id);
  }

  // Closed panels' elements are forgotten.
  useLayoutEffect(() => keepPanels(new Set(panels.map(({ id }) => id))));

  useLayoutEffect(() => {
    const element = root.current;
    const tabsBefore = previousTabs.current;
    previousTabs.current = tabs.map(({ id }) => id);
    const restoring = takePendingRestore();
    if (!element) return;
    const page = element.ownerDocument;
    const focused = page.activeElement;
    const lost = !focused || focused === page.body || !focused.isConnected;
    if (restoring !== null && isShown(placements.get(restoring))) {
      focusInto(restoring);
      return;
    }
    if (!focusBefore) return;
    const placement = placements.get(focusBefore.id);
    if (focusBefore.tab) {
      if (!lost) return;
      if (placement === undefined) {
        const index = tabsBefore.indexOf(focusBefore.id);
        const next = tabs[Math.min(index, tabs.length - 1)];
        if (next) focusTab(next.id);
        else focusRemaining();
      } else if (isShown(placement)) focusInto(focusBefore.id);
      return;
    }
    if (placement === undefined) {
      if (lost) focusRemaining();
    } else if (placement === 'hidden') {
      // Focus in a popup the panel opened, such as a menu in a portal, moves to the tab too.
      if (lost || focusBefore.popup || frameOf(focusBefore.id)?.contains(focused))
        focusTab(focusBefore.id);
    } else if (lost) {
      // A reorder can drop focus from an element that stays. An element that went with the new
      // layout, such as the resize handle of a panel that now fills the region, or Maximize in a
      // stacked dock, leaves focus to its panel.
      if (focusBefore.element.isConnected) focusBefore.element.focus({ preventScroll: true });
      else focusInto(focusBefore.id);
    }
  });
}
