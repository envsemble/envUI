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
  const lastFocusedInContent = useRef(new Map<string, HTMLElement>());
  const focusedPanel = useRef<FocusedPanel | null>(null);
  const panelToFocusOnceShown = useRef<string | null>(null);
  const before = locateFocus(root.current, focusedPanel.current);

  return {
    root,
    before,
    lastFocusedIn: (id: string) => lastFocusedInContent.current.get(id),
    keepPanels: (ids: ReadonlySet<string>) => {
      for (const id of lastFocusedInContent.current.keys())
        if (!ids.has(id)) lastFocusedInContent.current.delete(id);
    },
    takePendingRestore: () => {
      const id = panelToFocusOnceShown.current;
      panelToFocusOnceShown.current = null;
      return id;
    },
    focusedId: () => {
      const focus = locateFocus(root.current, focusedPanel.current);
      return focus && !focus.tab ? focus.id : undefined;
    },
    onFocusWithin: (id: string, element: EventTarget | null) => {
      if (element) focusedPanel.current = { id, element };
      else if (focusedPanel.current?.id === id) focusedPanel.current = null;
    },
    onFocusContent: (id: string, target: HTMLElement) =>
      lastFocusedInContent.current.set(id, target),
    focusOnShow: (id: string) => {
      panelToFocusOnceShown.current = id;
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
    tabs: readonly Panel[];
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

  function focusTabWithoutBrowserScroll(id: string | undefined) {
    const tab = [...(strip.current?.children ?? [])].find(
      (element) => element instanceof HTMLElement && element.dataset.panelId === id,
    );
    const button = tab?.querySelector<HTMLButtonElement>('.env-panel-dock-tab-restore');
    if (!button) return;
    button.focus({ preventScroll: true });
    revealInWindow(button.ownerDocument.defaultView, button.getBoundingClientRect());
  }

  function focusRemaining() {
    const visible = panels.filter((panel) => placements.get(panel.id) !== 'hidden');
    const target =
      visible.find((panel) => panel.active) ??
      visible.filter((panel) => placements.get(panel.id) === 'row').at(-1) ??
      filling;
    if (target) focusInto(target.id);
    else focusTabWithoutBrowserScroll(tabs.at(-1)?.id);
  }

  useLayoutEffect(() => keepPanels(new Set(panels.map(({ id }) => id))));

  useLayoutEffect(() => {
    const element = root.current;
    const tabsBefore = previousTabs.current;
    previousTabs.current = tabs.map(({ id }) => id);
    const restoring = takePendingRestore();
    if (!element) return;
    const page = element.ownerDocument;
    const focused = page.activeElement;
    const focusLost = !focused || focused === page.body || !focused.isConnected;
    if (restoring !== null && isShown(placements.get(restoring))) {
      focusInto(restoring);
      return;
    }
    if (!focusBefore) return;
    const placement = placements.get(focusBefore.id);
    if (focusBefore.tab) {
      if (!focusLost) return;
      if (placement === undefined) {
        const index = tabsBefore.indexOf(focusBefore.id);
        const next = tabs[Math.min(index, tabs.length - 1)];
        if (next) focusTabWithoutBrowserScroll(next.id);
        else focusRemaining();
      } else if (isShown(placement)) focusInto(focusBefore.id);
      return;
    }
    if (placement === undefined) {
      if (focusLost) focusRemaining();
    } else if (placement === 'hidden') {
      const focusWasInPanelOrItsPopup =
        focusLost || focusBefore.popup || frameOf(focusBefore.id)?.contains(focused);
      if (focusWasInPanelOrItsPopup) focusTabWithoutBrowserScroll(focusBefore.id);
    } else if (focusLost) {
      const elementStayedThroughReorder = focusBefore.element.isConnected;
      if (elementStayedThroughReorder) focusBefore.element.focus({ preventScroll: true });
      else focusInto(focusBefore.id);
    }
  });
}
