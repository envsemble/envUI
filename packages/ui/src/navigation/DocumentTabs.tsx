'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import {
  useRef,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { IconButton } from '../actions/Button.js';
import { IconClose } from '../icons/Close.js';
import { classNames } from '../internal/classNames.js';
import { Row } from '../layout/Layout.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { useDirection } from '../internal/useDirection.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { documentTabs } from '../foundations/messages/documentTabs.js';
import { ContextMenu } from '../actions/ContextMenu.js';
import * as Menu from '../actions/Menu.js';
import { isRightToLeft } from '../internal/direction.js';
import { moveValue } from './internal/tabStrip.js';
import { useTabCloseFocus } from './internal/useTabCloseFocus.js';
import { useTabDrag } from './internal/useTabDrag.js';
import { useTabStripScrolling } from './internal/useTabStripScrolling.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/DocumentTabs.css';

/** How far the floating copy of a dragged tab sits from the pointer, in pixels. */
const dragImageOffset = 12;

export interface DocumentTabsItem {
  /** The tab's value, a stable identifier, such as the document's path; value names the active one. */
  value: string;
  /** The document's name, which names the tab and its close button. */
  label: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** The tab's native tooltip, such as the full path; the label by default. */
  tooltip?: string;
  /** A preview tab shows its label in italics until it is pinned. */
  preview?: boolean;
}

export interface DocumentTabsProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'aria-label'
> {
  /** The open documents, in tab order. */
  items: readonly DocumentTabsItem[];
  /** The active tab, or null. */
  value: string | null;
  /** Called with the tab's value when it is clicked or reached with the arrow keys, Home or End. */
  onValueChange: (value: string) => void;
  /**
   * Called from a tab's close button, a middle click, Delete or Backspace on the focused tab, and
   * Close in the tab's context menu.
   */
  onClose: (id: string) => void;
  /** Called when a tab is double-clicked, typically to keep a preview tab open. */
  onPin?: (id: string) => void;
  /**
   * Called with every tab's value in the new order when a tab is dragged to another place with a
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
   * @default 'Tab actions', or EnvUIProvider's messages.documentTabs.contextMenu
   */
  contextMenuLabel?: string;
}

/**
 * Editor-style closable tabs for open documents; the application renders the active document.
 * className, style, ref and the other native props go to the root element, which holds the strip
 * of tabs and the actions at its end.
 */
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
  ...props
}: DocumentTabsProps) {
  const messages = useMessages('documentTabs', documentTabs);
  const closeName = closeLabel ?? ((name: string) => messages.close({ label: name }));
  const list = useRef<HTMLDivElement | null>(null);
  // ← and → follow the text direction: the EnvUIProvider's, or the one at the strip.
  const [direction] = useDirection(list);
  const focusable = items.some((item) => item.value === value) ? value : (items[0]?.value ?? null);

  const fades = useTabStripScrolling(list, value, items);
  const closeFocus = useTabCloseFocus(list, items, focusable);
  const { drag, onItemPointerDown } = useTabDrag({ list, items, onReorder });

  // The line shows in the gap the tab would drop into: before the tab after that gap, or after the
  // last tab.
  const dragged = drag ? items.find((item) => item.value === drag.id) : undefined;
  const dropBefore = drag && drag.gap < items.length ? items[drag.gap]?.value : undefined;
  const dropAfter = drag && drag.gap >= items.length ? items.at(-1)?.value : undefined;

  /** The place a tab moves to, one to the left or right on screen, or -1 at the end. */
  function moveTarget(id: string, side: 'left' | 'right') {
    const index = items.findIndex((item) => item.value === id);
    const rtl = list.current ? isRightToLeft(list.current) : false;
    const target = index + ((side === 'right') !== rtl ? 1 : -1);
    return index < 0 || target < 0 || target >= items.length ? -1 : target;
  }

  function moveTab(id: string, side: 'left' | 'right') {
    const target = moveTarget(id, side);
    if (target < 0) return;
    onReorder?.(
      moveValue(
        items.map((item) => item.value),
        id,
        target,
      ),
    );
  }

  // Keys with Alt, Ctrl or ⌘ belong to the application, such as Ctrl+W or Alt+← for going back.
  function onListKeyDown(
    event: KeyboardEvent<HTMLDivElement> & { preventBaseUIHandler?: () => void },
  ) {
    if (event.altKey || event.ctrlKey || event.metaKey) event.preventBaseUIHandler?.();
  }

  const strip = (
    <BaseTabs.List
      ref={list}
      aria-label={label}
      activateOnFocus
      render={<Row align="stretch" />}
      className="env-document-tabs-list"
      data-fade-left={flag(fades.left)}
      data-fade-right={flag(fades.right)}
      data-reordering={flag(drag)}
      onKeyDown={onListKeyDown}
    >
      {items.map((item) => (
        <DocumentTab
          key={item.value}
          item={item}
          active={item.value === value}
          focusable={item.value === focusable}
          panelId={panelId}
          closeName={closeName}
          moving={drag?.id === item.value}
          drop={
            item.value === dropBefore ? 'before' : item.value === dropAfter ? 'after' : undefined
          }
          onPointerDown={(event) => onItemPointerDown(event, item.value)}
          onClose={onClose}
          onPin={onPin}
        />
      ))}
    </BaseTabs.List>
  );

  return (
    <DirectionProvider direction={direction}>
      <BaseTabs.Root
        {...props}
        value={value}
        onValueChange={(next) => {
          if (typeof next === 'string') onValueChange(next);
        }}
        render={<Row align="center" />}
        className={classNames('env-document-tabs', className)}
      >
        <ContextMenu
          aria-label={contextMenuLabel ?? messages.contextMenu}
          onOpenChange={closeFocus.onMenuOpenChange}
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
              <TabMenuItems
                tab={onTab ? { id, label: tab.getAttribute('aria-label') ?? '' } : undefined}
                closeName={closeName}
                onClose={(tabId) => {
                  closeFocus.onCloseFromMenu();
                  onClose(tabId);
                }}
                onMove={onReorder && moveTab}
                canMove={(tabId, side) => moveTarget(tabId, side) >= 0}
                closeAll={
                  onCloseAll && {
                    onClick: onCloseAll,
                    label: closeAllLabel ?? messages.closeAll,
                    disabled: items.length === 0,
                  }
                }
                moveLeftLabel={messages.moveLeft}
                moveRightLabel={messages.moveRight}
              />
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
            style={{ left: drag.x + dragImageOffset, top: drag.y + dragImageOffset }}
          >
            {dragged.icon != null && <DecorativeIcon>{dragged.icon}</DecorativeIcon>}
            <span className="env-document-tabs-tab-label">{dragged.label}</span>
          </div>
        )}
      </BaseTabs.Root>
    </DirectionProvider>
  );
}

/** Whether a key closes the focused tab: Delete, or Backspace for keyboards without a forward Delete key. */
function closesTab(event: KeyboardEvent<HTMLElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return false;
  if (event.key !== 'Delete' && event.key !== 'Backspace') return false;
  event.preventDefault();
  // A held key closes one tab, not the tab after it as each repeat arrives.
  return !event.repeat;
}

/**
 * One document's tab beside its close button. The item lays the two out side by side, so the close
 * button isn't nested in the tab. It is a pointer's affordance: the keyboard closes a tab with
 * Delete or Backspace, as aria-keyshortcuts says, or from the context menu.
 */
function DocumentTab({
  item,
  active,
  focusable,
  panelId,
  closeName,
  moving,
  drop,
  onPointerDown,
  onClose,
  onPin,
}: Pick<DocumentTabsProps, 'panelId' | 'onClose' | 'onPin'> & {
  item: DocumentTabsItem;
  active: boolean;
  /** The tab that Tab reaches in the strip. */
  focusable: boolean;
  closeName: (label: string) => string;
  /** The tab is being dragged. */
  moving: boolean;
  /** The side of the tab a dragged tab would drop on, where it would drop beside it. */
  drop: 'before' | 'after' | undefined;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className="env-document-tabs-item"
      data-active={flag(active)}
      data-moving={moving ? 'pointer' : undefined}
      data-drop={drop}
      onPointerDown={onPointerDown}
      onMouseDown={(event) => {
        // A middle press would otherwise start autoscrolling.
        if (event.button === 1) event.preventDefault();
      }}
      onAuxClick={(event) => {
        if (event.button !== 1) return;
        event.preventDefault();
        onClose(item.value);
      }}
    >
      <BaseTabs.Tab
        value={item.value}
        className="env-document-tabs-tab"
        // The label names the tab, whatever its icon.
        aria-label={item.label}
        aria-controls={active ? panelId : undefined}
        aria-keyshortcuts="Delete Backspace"
        title={item.tooltip ?? item.label}
        tabIndex={focusable ? 0 : -1}
        data-tab-id={item.value}
        data-preview={flag(item.preview)}
        onDoubleClick={() => onPin?.(item.value)}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          if (closesTab(event)) onClose(item.value);
        }}
      >
        {item.icon != null && <DecorativeIcon>{item.icon}</DecorativeIcon>}
        <span className="env-document-tabs-tab-label">{item.label}</span>
      </BaseTabs.Tab>
      <IconButton
        variant="ghost"
        icon={<IconClose />}
        aria-label={closeName(item.label)}
        aria-hidden
        tabIndex={-1}
        title={closeName(item.label)}
        className="env-document-tabs-close"
        onClick={() => onClose(item.value)}
      />
    </div>
  );
}

/**
 * The context menu's items: on a tab, Close and, where the tabs reorder, Move left and Move right;
 * Close all tabs where the application offers it.
 */
function TabMenuItems({
  tab,
  closeName,
  onClose,
  onMove,
  canMove,
  closeAll,
  moveLeftLabel,
  moveRightLabel,
}: {
  /** The tab the menu opened on, if it opened on one. */
  tab: { id: string; label: string } | undefined;
  closeName: (label: string) => string;
  onClose: (id: string) => void;
  /** Moves a tab one place on screen, where the tabs reorder. */
  onMove: ((id: string, side: 'left' | 'right') => void) | undefined;
  canMove: (id: string, side: 'left' | 'right') => boolean;
  closeAll: { onClick: () => void; label: string; disabled: boolean } | undefined;
  moveLeftLabel: string;
  moveRightLabel: string;
}) {
  return (
    <>
      {tab && <Menu.Item onClick={() => onClose(tab.id)}>{closeName(tab.label)}</Menu.Item>}
      {tab && onMove && (
        <>
          <Menu.Item onClick={() => onMove(tab.id, 'left')} disabled={!canMove(tab.id, 'left')}>
            {moveLeftLabel}
          </Menu.Item>
          <Menu.Item onClick={() => onMove(tab.id, 'right')} disabled={!canMove(tab.id, 'right')}>
            {moveRightLabel}
          </Menu.Item>
        </>
      )}
      {closeAll && (
        <Menu.Item onClick={closeAll.onClick} disabled={closeAll.disabled}>
          {closeAll.label}
        </Menu.Item>
      )}
    </>
  );
}
