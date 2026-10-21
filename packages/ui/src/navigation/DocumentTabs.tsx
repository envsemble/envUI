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
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { CloseButton } from '../actions/CloseButton.js';
import { classNames } from '../internal/classNames.js';
import { Row } from '../foundations/Layout.js';
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
  /**
   * Called with every tab's id in the new order when a tab is dragged to another place with a
   * mouse or pen, or moved with Move left or Move right in its context menu, which also reach
   * the keyboard and touch. Without it, the tabs keep their order.
   */
  onReorder?: (ids: string[]) => void;
  /**
   * Content after the tabs, outside the strip that scrolls and in line with it, such as a button
   * that closes every tab or opens a new one.
   */
  end?: ReactNode;
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
  onReorder,
  end,
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
      // The tab clears the fade at the edge it comes in from, so none of it is faded. Only an edge
      // with more to scroll past it has a fade: at the strip's ends there is no room to leave.
      const rem = parseFloat(getComputedStyle(strip.ownerDocument.documentElement).fontSize);
      const fade = parseFloat(getComputedStyle(strip).getPropertyValue('--env-document-tabs-fade'));
      const room = Number.isFinite(fade) ? fade * rem : 0;
      const beyond = scrollBeyond(strip);
      const stripBox = strip.getBoundingClientRect();
      const tabBox = tab.getBoundingClientRect();
      const roomLeft = beyond.left ? room : 0;
      const roomRight = beyond.right ? room : 0;
      if (tabBox.left < stripBox.left + roomLeft)
        strip.scrollLeft -= stripBox.left + roomLeft - tabBox.left;
      else if (tabBox.right > stripBox.right - roomRight)
        strip.scrollLeft += tabBox.right - (stripBox.right - roomRight);
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
  // button, Delete, the context menu, or the application's own shortcut such as Ctrl+W. The focused
  // tab is read before the update is committed, while the closing tab still holds focus. Any other
  // render, such as a parent passing a new items array, leaves focus where it is. The context menu
  // holds focus instead when the strip had it as the menu opened.
  const focusedTab = focusedTabId(list.current);
  const focusedTabClosed = focusedTab !== null && !items.some((item) => item.id === focusedTab);
  const menuOpenedInside = useRef(false);
  const [closedFromMenu, setClosedFromMenu] = useState(false);
  useLayoutEffect(() => {
    if (closedFromMenu) setClosedFromMenu(false);
    else {
      if (!focusedTabClosed) return;
      const active = list.current?.ownerDocument.activeElement;
      if (active && active !== active.ownerDocument.body && active.isConnected) return;
    }
    tabElement(focusable)?.focus();
  }, [items, focusable, focusedTabClosed, closedFromMenu]);

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

  // Tabs that run past an edge of the strip fade out toward that edge, so the strip shows it
  // scrolls. In right-to-left text scrollLeft runs from 0 down to -max.
  const [fades, setFades] = useState({ left: false, right: false });
  useEffect(() => {
    const strip = list.current;
    if (!strip) return;
    const update = () => {
      const { left, right } = scrollBeyond(strip);
      setFades((current) =>
        current.left === left && current.right === right ? current : { left, right },
      );
    };
    update();
    strip.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(strip);
    for (const child of strip.children) observer.observe(child);
    return () => {
      strip.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [items]);

  // A tab dragged with a mouse or pen follows the pointer as a floating copy, and a line in the
  // strip marks where it will land; the tabs take their new order when it is let go, and Escape
  // cancels. Touch scrolls the strip instead, and its long press opens the context menu with Move
  // left and Move right.
  const [drag, setDrag] = useState<{ id: string; gap: number; x: number; y: number } | null>(null);
  const latest = useRef({ items, onReorder });
  latest.current = { items, onReorder };
  function onItemPointerDown(event: ReactPointerEvent<HTMLElement>, id: string) {
    const strip = list.current;
    if (!onReorder || !strip || event.button !== 0 || event.pointerType === 'touch') return;
    if ((event.target as Element).closest('.env-document-tabs-close')) return;
    const startX = event.clientX;
    const startIndex = items.findIndex((item) => item.id === id);
    let moved = false;
    // The gap the tab would drop into: 0 before the first tab, items.length after the last.
    let gap = startIndex;
    const view = strip.ownerDocument.defaultView ?? window;
    const onMove = (move: PointerEvent) => {
      if (!moved) {
        if (Math.abs(move.clientX - startX) < 4) return;
        moved = true;
      }
      move.preventDefault();
      // Near an edge the strip scrolls, so a tab reaches places out of view.
      const box = strip.getBoundingClientRect();
      if (move.clientX < box.left + 24) strip.scrollLeft -= 8;
      else if (move.clientX > box.right - 24) strip.scrollLeft += 8;
      // The gap nearest the pointer: before the tab under it in that tab's starting half, after it
      // in the other, also beside the dragged tab itself; past the ends, the nearest tab counts.
      const current = latest.current.items;
      const rtl = getComputedStyle(strip).direction === 'rtl';
      let distance = Infinity;
      current.forEach((item, position) => {
        const tab = tabElement(item.id)?.parentElement;
        if (!tab) return;
        const itemBox = tab.getBoundingClientRect();
        const away =
          move.clientX < itemBox.left
            ? itemBox.left - move.clientX
            : Math.max(0, move.clientX - itemBox.right);
        if (away >= distance) return;
        distance = away;
        const middle = itemBox.left + itemBox.width / 2;
        const startHalf = rtl ? move.clientX > middle : move.clientX < middle;
        gap = startHalf ? position : position + 1;
      });
      setDrag({ id, gap, x: move.clientX, y: move.clientY });
    };
    const stop = () => {
      view.removeEventListener('pointermove', onMove);
      view.removeEventListener('pointerup', onUp);
      view.removeEventListener('pointercancel', cancel);
      view.removeEventListener('keydown', onKeyDown, true);
      setDrag(null);
    };
    const cancel = () => {
      moved = false;
      stop();
    };
    const onKeyDown = (key: globalThis.KeyboardEvent) => {
      if (key.key !== 'Escape') return;
      key.preventDefault();
      key.stopPropagation();
      cancel();
    };
    const onUp = () => {
      const dropped = moved;
      stop();
      if (!dropped) return;
      // The click that ends a drag does nothing more. It arrives with the release, if at all, so
      // the guard goes after it, and a release with no click leaves the next click alone.
      const swallow = (click: MouseEvent) => click.stopPropagation();
      view.addEventListener('click', swallow, { capture: true, once: true });
      view.setTimeout(() => view.removeEventListener('click', swallow, { capture: true }), 0);
      const { items: current, onReorder: reorder } = latest.current;
      // A gap beside the tab itself leaves it where it is.
      const index = gap > startIndex ? gap - 1 : gap;
      if (index === startIndex) return;
      const next = current.map((item) => item.id).filter((other) => other !== id);
      next.splice(index, 0, id);
      reorder?.(next);
    };
    view.addEventListener('pointermove', onMove);
    view.addEventListener('pointerup', onUp);
    view.addEventListener('pointercancel', cancel);
    view.addEventListener('keydown', onKeyDown, true);
  }

  // The line shows in the gap the tab would drop into: before the tab after that gap, or after the
  // last tab.
  const dragged = drag ? items.find((item) => item.id === drag.id) : undefined;
  const dropBefore = drag && drag.gap < items.length ? items[drag.gap]?.id : undefined;
  const dropAfter = drag && drag.gap >= items.length ? items.at(-1)?.id : undefined;

  /** The place a tab moves to, one to the left or right on screen, or -1 at the end. */
  function moveTarget(id: string, side: 'left' | 'right') {
    const index = items.findIndex((item) => item.id === id);
    const rtl = list.current ? getComputedStyle(list.current).direction === 'rtl' : false;
    const target = index + ((side === 'right') !== rtl ? 1 : -1);
    return index < 0 || target < 0 || target >= items.length ? -1 : target;
  }

  function moveTab(id: string, side: 'left' | 'right') {
    const target = moveTarget(id, side);
    if (target < 0) return;
    const next = items.map((item) => item.id).filter((other) => other !== id);
    next.splice(target, 0, id);
    onReorder?.(next);
  }

  // Keys with Alt, Ctrl or ⌘ belong to the application, such as Ctrl+W or Alt+← for going back.
  function onListKeyDown(
    event: KeyboardEvent<HTMLDivElement> & { preventBaseUIHandler?: () => void },
  ) {
    if (event.altKey || event.ctrlKey || event.metaKey) event.preventBaseUIHandler?.();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLElement>, id: string) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    // Backspace too, for keyboards without a forward Delete key.
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    event.preventDefault();
    // A held key closes one tab, not the tab after it as each repeat arrives.
    if (event.repeat) return;
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
      render={<Row align="stretch" />}
      className={classNames('env-document-tabs', className)}
      style={style}
      data-fade-left={fades.left ? '' : undefined}
      data-fade-right={fades.right ? '' : undefined}
      data-reordering={drag ? '' : undefined}
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
            data-dragging={drag?.id === item.id ? '' : undefined}
            data-drop={
              item.id === dropBefore ? 'before' : item.id === dropAfter ? 'after' : undefined
            }
            onPointerDown={(event) => onItemPointerDown(event, item.id)}
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
        <Row align="center" className="env-document-tabs-bar">
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
                  {onTab && onReorder && (
                    <>
                      <Menu.Item
                        onClick={() => moveTab(id, 'left')}
                        disabled={moveTarget(id, 'left') < 0}
                      >
                        {messages.moveLeft}
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => moveTab(id, 'right')}
                        disabled={moveTarget(id, 'right') < 0}
                      >
                        {messages.moveRight}
                      </Menu.Item>
                    </>
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
          {end != null && (
            <Row align="center" gap={1} className="env-document-tabs-end">
              {end}
            </Row>
          )}
          {drag && dragged && (
            // The floating copy of the dragged tab, beside the pointer; decorative, since the drag is
            // a pointer's alternative to the context menu.
            <div
              className="env-document-tabs-drag-image"
              aria-hidden="true"
              style={{ left: drag.x + 12, top: drag.y + 12 }}
            >
              {dragged.icon != null && <DecorativeIcon>{dragged.icon}</DecorativeIcon>}
              <span className="env-document-tabs-tab-label">{dragged.label}</span>
            </div>
          )}
        </Row>
      </BaseTabs.Root>
    </DirectionProvider>
  );
}

/**
 * Whether the strip has tabs past its left and right edges to scroll to. In right-to-left text
 * scrollLeft runs from 0 down to -max. Less than 1.5 px doesn't count: subpixel rounding can leave a
 * pixel of scroll range, past even the start, that hides nothing.
 */
function scrollBeyond(strip: HTMLElement) {
  const max = strip.scrollWidth - strip.clientWidth;
  const scrolled = strip.scrollLeft;
  const rtl = getComputedStyle(strip).direction === 'rtl';
  const leftOver = rtl ? max + scrolled : scrolled;
  const rightOver = rtl ? -scrolled : max - scrolled;
  return { left: max > 1.5 && leftOver > 1.5, right: max > 1.5 && rightOver > 1.5 };
}

/** The id of the tab whose item holds focus within the strip, or null. */
function focusedTabId(strip: HTMLElement | null) {
  const active = strip?.ownerDocument.activeElement;
  if (!strip || !active || !strip.contains(active)) return null;
  return (
    active.closest('.env-document-tabs-item')?.querySelector<HTMLElement>('[role="tab"]')?.dataset
      .tabId ?? null
  );
}
