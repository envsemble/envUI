'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { focusedTabId, tabElement } from './tabStrip.js';

/**
 * Closing the focused tab moves focus to the tab that becomes active, however it closed: its
 * button, Delete, the context menu, or the application's own shortcut such as Ctrl+W. The focused
 * tab is read before the update is committed, while the closing tab still holds focus. Any other
 * render, such as a parent passing a new items array, leaves focus where it is. The context menu
 * holds focus instead when the strip had it as the menu opened.
 */
export function useTabCloseFocus(
  list: RefObject<HTMLElement | null>,
  items: readonly { value: string }[],
  /** The tab that takes focus: the active one, or the first. */
  focusable: string | null,
) {
  const focusedTab = focusedTabId(list.current);
  const focusedTabClosed = focusedTab !== null && !items.some((item) => item.value === focusedTab);
  const menuOpenedInside = useRef(false);
  const [closedFromMenu, setClosedFromMenu] = useState(false);
  useLayoutEffect(() => {
    if (closedFromMenu) setClosedFromMenu(false);
    else {
      if (!focusedTabClosed) return;
      const active = list.current?.ownerDocument.activeElement;
      if (active && active !== active.ownerDocument.body && active.isConnected) return;
    }
    tabElement(list.current, focusable)?.focus();
  }, [list, items, focusable, focusedTabClosed, closedFromMenu]);

  return {
    /** The context menu opened or closed. */
    onMenuOpenChange: (open: boolean) => {
      if (open)
        menuOpenedInside.current = Boolean(
          list.current?.contains(list.current.ownerDocument.activeElement),
        );
    },
    /** The context menu is closing a tab. */
    onCloseFromMenu: () => {
      if (menuOpenedInside.current) setClosedFromMenu(true);
    },
  };
}
