'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { CloseButton } from '../actions/CloseButton.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { useDirection } from '../internal/useDirection.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { setRef } from '../internal/setRef.js';
import { documentTabs } from '../foundations/messages/documentTabs.js';
import { ContextMenu } from './ContextMenu.js';
import * as Menu from './Menu.js';

export interface DocumentTab {
  /** Stable identifier; the tab carries it as data-tab-id. */
  id: string;
  /** The document's name, which names the tab and its close button. */
  label: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Native tooltip, such as the full path; the label by default. */
  title?: string;
  /** A preview tab shows its label in italics until it is pinned. */
  preview?: boolean;
}

export interface DocumentTabsProps {
  /** The open documents, in tab order. */
  items: readonly DocumentTab[];
  /** The active tab, or null. */
  value: string | null;
  /** Called when a tab is clicked or reached with the arrow keys, Home or End. */
  onValueChange: (id: string) => void;
  /**
   * Called from a tab's close button, a middle click, Delete or Backspace on the focused tab, and
   * Close in the tab's context menu.
   */
  onClose: (id: string) => void;
  /** Called when a tab is double-clicked, typically to keep a preview tab open. */
  onPin?: (id: string) => void;
  /** Accessible name of the tab strip. */
  'aria-label': string;
  /** Id of the panel the application renders for the active tab. */
  panelId?: string;
  /**
   * The name of the context menu's item that closes a tab, and the tooltip of its close button.
   * @default 'Close {label}', or EnvUIProvider's messages.documentTabs.close
   */
  closeLabel?: (label: string) => string;
  /**
   * Called from Close all tabs in the context menu. Each tab opens a context menu that closes it on
   * right click, long press, the Menu key and Shift+F10; with onCloseAll, the menu also offers
   * Close all tabs, and the strip around the tabs opens it too.
   */
  onCloseAll?: () => void;
  /**
   * Label of the Close all tabs item.
   * @default 'Close all tabs', or EnvUIProvider's messages.documentTabs.closeAll
   */
  closeAllLabel?: string;
  /**
   * Accessible name of the context menu.
   * @default 'Tab actions', or EnvUIProvider's messages.documentTabs.actions
   */
  contextMenuLabel?: string;
  /** Classes for the strip, the tab list. */
  className?: string;
  /** The strip's inline style. */
  style?: CSSProperties;
  /** The strip, the tab list element. */
  ref?: Ref<HTMLDivElement>;
}

/** Editor-style closable tabs for open documents; the application renders the active document. */
export function DocumentTabs({
  items,
  value,
  onValueChange,
  onClose,
  onPin,
  'aria-label': label,
  panelId,
  closeLabel,
  onCloseAll,
  closeAllLabel,
  contextMenuLabel,
  className,
  style,
  ref,
}: DocumentTabsProps) {
  const messages = useMessages('documentTabs', documentTabs);
  const closeName = closeLabel ?? ((name: string) => messages.close({ label: name }));
  const list = useRef<HTMLDivElement | null>(null);
  // ← and → follow the text direction: the EnvUIProvider's, or the one at the strip.
  const [direction] = useDirection(list);
  const focusable = items.some((item) => item.id === value) ? value : (items[0]?.id ?? null);

  function tabElement(id: string | null) {
    if (id === null || !list.current) return null;
    for (const tab of list.current.querySelectorAll<HTMLElement>('[role="tab"]'))
      if (tab.dataset.tabId === id) return tab;
    return null;
  }

  // The active tab scrolls into view within the strip, without scrolling the page.
  useLayoutEffect(() => {
    function reveal() {
      const strip = list.current;
      const tab = tabElement(value)?.parentElement;
      if (!strip || !tab) return;
      const stripBox = strip.getBoundingClientRect();
      const tabBox = tab.getBoundingClientRect();
      if (tabBox.left < stripBox.left) strip.scrollLeft -= stripBox.left - tabBox.left;
      else if (tabBox.right > stripBox.right) strip.scrollLeft += tabBox.right - stripBox.right;
    }
    reveal();
    // Base UI also scrolls the active tab into view, and the labels may still widen as the font
    // loads: the whole item, close button included, is revealed again once both have settled.
    let cancelled = false;
    const frame = requestAnimationFrame(reveal);
    void document.fonts?.ready.then(() => {
      if (!cancelled) reveal();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [value, items]);

  // Closing the focused tab moves focus to the tab that becomes active, however it closed: its
  // button, Delete, the context menu, or the application's own shortcut such as Ctrl+W. Read before
  // the update is committed, while the closing tab still holds focus. The context menu holds focus
  // instead when the strip had it as the menu opened.
  const focusWasInside = Boolean(list.current?.contains(list.current.ownerDocument.activeElement));
  const menuOpenedInside = useRef(false);
  const [closedFromMenu, setClosedFromMenu] = useState(false);
  useLayoutEffect(() => {
    if (closedFromMenu) setClosedFromMenu(false);
    else {
      if (!focusWasInside) return;
      const active = list.current?.ownerDocument.activeElement;
      if (active && active !== active.ownerDocument.body && active.isConnected) return;
    }
    tabElement(focusable)?.focus();
  }, [items, focusable, focusWasInside, closedFromMenu]);

  // A vertical wheel scrolls an overflowing strip sideways, toward its end as the wheel turns down.
  // In right-to-left text the end is on the left, where scrollLeft runs from 0 down to -max.
  useEffect(() => {
    const strip = list.current;
    if (!strip) return;
    const onWheel = (event: WheelEvent) => {
      if (event.deltaX !== 0 || event.deltaY === 0 || event.ctrlKey) return;
      const max = strip.scrollWidth - strip.clientWidth;
      if (max <= 0) return;
      const rtl = getComputedStyle(strip).direction === 'rtl';
      const next = rtl
        ? Math.min(0, Math.max(-max, strip.scrollLeft - event.deltaY))
        : Math.min(max, Math.max(0, strip.scrollLeft + event.deltaY));
      if (next === strip.scrollLeft) return;
      event.preventDefault();
      strip.scrollLeft = next;
    };
    strip.addEventListener('wheel', onWheel, { passive: false });
    return () => strip.removeEventListener('wheel', onWheel);
  }, []);

  // Keys with Alt, Ctrl or ⌘ belong to the application, such as Ctrl+W or Alt+← for going back.
  function onListKeyDown(
    event: KeyboardEvent<HTMLDivElement> & { preventBaseUIHandler?: () => void },
  ) {
    if (event.altKey || event.ctrlKey || event.metaKey) event.preventBaseUIHandler?.();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLElement>, id: string) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    // Backspace too, as a Mac laptop has no forward Delete key.
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    event.preventDefault();
    onClose(id);
  }

  const strip = (
    <BaseTabs.List
      ref={(node: HTMLDivElement | null) => {
        list.current = node;
        setRef(ref, node);
      }}
      aria-label={label}
      activateOnFocus
      className={classNames('env-document-tabs', className)}
      style={style}
      onKeyDown={onListKeyDown}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          // The item lays out the tab and its close button side by side, so the close button
          // isn't nested in the tab. It is a pointer's affordance: the keyboard closes a tab with
          // Delete or Backspace, as aria-keyshortcuts says, or from the context menu.
          <div
            key={item.id}
            className="env-document-tabs-item"
            data-active={active ? '' : undefined}
            onMouseDown={(event) => {
              // A middle press would otherwise start autoscrolling.
              if (event.button === 1) event.preventDefault();
            }}
            onAuxClick={(event) => {
              if (event.button !== 1) return;
              event.preventDefault();
              onClose(item.id);
            }}
          >
            <BaseTabs.Tab
              value={item.id}
              className="env-document-tabs-tab"
              // The label names the tab, whatever its icon.
              aria-label={item.label}
              aria-controls={active ? panelId : undefined}
              aria-keyshortcuts="Delete Backspace"
              title={item.title ?? item.label}
              tabIndex={item.id === focusable ? 0 : -1}
              data-tab-id={item.id}
              data-preview={item.preview ? 'true' : 'false'}
              onDoubleClick={() => onPin?.(item.id)}
              onKeyDown={(event: KeyboardEvent<HTMLElement>) => onTabKeyDown(event, item.id)}
            >
              {item.icon != null && <DecorativeIcon>{item.icon}</DecorativeIcon>}
              <span className="env-document-tabs-tab-label">{item.label}</span>
            </BaseTabs.Tab>
            <CloseButton
              aria-hidden
              tabIndex={-1}
              title={closeName(item.label)}
              className="env-document-tabs-close"
              onClick={() => onClose(item.id)}
            />
          </div>
        );
      })}
    </BaseTabs.List>
  );

  return (
    <DirectionProvider direction={direction}>
      <BaseTabs.Root
        value={value}
        onValueChange={(next) => {
          if (typeof next === 'string') onValueChange(next);
        }}
        className="env-document-tabs-root"
      >
        <ContextMenu
          aria-label={contextMenuLabel ?? messages.actions}
          onOpenChange={(open) => {
            if (open)
              menuOpenedInside.current = Boolean(
                list.current?.contains(list.current.ownerDocument.activeElement),
              );
          }}
          content={(target) => {
            // Read from the tab's item, so the menu keeps its items while it closes after the tab.
            const tab = target
              ?.closest('.env-document-tabs-item')
              ?.querySelector<HTMLElement>('[role="tab"]');
            const id = tab?.dataset.tabId;
            const onTab = tab != null && id !== undefined;
            // Without onCloseAll, only a tab offers a menu.
            if (!onTab && !onCloseAll) return null;
            return (
              <>
                {onTab && (
                  <Menu.Item
                    onClick={() => {
                      if (menuOpenedInside.current) setClosedFromMenu(true);
                      onClose(id);
                    }}
                  >
                    {closeName(tab.getAttribute('aria-label') ?? '')}
                  </Menu.Item>
                )}
                {onCloseAll && (
                  <Menu.Item onClick={onCloseAll} disabled={items.length === 0}>
                    {closeAllLabel ?? messages.closeAll}
                  </Menu.Item>
                )}
              </>
            );
          }}
        >
          {strip}
        </ContextMenu>
      </BaseTabs.Root>
    </DirectionProvider>
  );
}
