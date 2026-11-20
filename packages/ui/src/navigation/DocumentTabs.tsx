'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import {
  useId,
  useRef,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { IconButton } from '../actions/Button.js';
import { IconClose } from '../icons/Close.js';
import { classNames } from '../internal/classNames.js';
import { Column, Row } from '../layout/Layout.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { Slot } from '../internal/layout/Slot.js';
import { useDirection } from '../internal/provider/useDirection.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { documentTabs } from '../foundations/messages/documentTabs.js';
import { ContextMenu } from '../actions/ContextMenu.js';
import * as Menu from '../actions/menu/Menu.js';
import { isRightToLeft } from '../internal/dom/direction.js';
import { moveValue } from './internal/documentTabs/tabStrip.js';
import { useTabCloseFocus } from './internal/documentTabs/useTabCloseFocus.js';
import { useTabDrag } from './internal/documentTabs/useTabDrag.js';
import { useTabStripScrolling } from './internal/documentTabs/useTabStripScrolling.js';
import { flag } from '../internal/flag.js';
import { useLabelText } from './internal/labelText.js';
import '../styles/Base.css';
import '../styles/DocumentTabs.css';

const dragImageOffsetFromPointerPx = 12;

export interface DocumentTabsItem {
  /** The tab's value, a stable identifier, such as the document's path; value names the active one. */
  value: string;
  /**
   * The document's name, which names the tab and its close button: text, or content, such as a
   * dimmed folder before a name two tabs share.
   */
  label: ReactNode;
  /**
   * The name as plain text, for the tab's name and native tooltip, its close button's name and its
   * context menu, where the label's text isn't it.
   * @default the label when it is a string, else the label's rendered text
   */
  textValue?: string;
  /**
   * Content after the tab's name, such as a dot for unsaved changes or a status Badge. It keeps its
   * size and is left out of the tab's name, which the label gives.
   */
  end?: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** The tab's native tooltip, such as the full path; the label's text by default. */
  tooltip?: string;
  /** A preview tab shows its label in italics until it is pinned. */
  preview?: boolean;
  /**
   * The tab can be closed: its close button, a middle click, Delete and Backspace, and Close in its
   * context menu. False keeps it open, such as a pinned or welcome tab.
   * @default true
   */
  closable?: boolean;
  /**
   * More props for the tab's element, the one that holds the tab and its close button, such as a
   * className or data attributes for tests. Its class joins the tab's; its handlers run before the
   * tab's own.
   */
  itemProps?: DocumentTabsItemElementProps;
}

/** What a document tab's itemProps can set on its element. */
export type DocumentTabsItemElementProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'id' | 'role' | 'title' | 'dangerouslySetInnerHTML' | `aria-${string}`
> & { [attribute: `data-${string}`]: string | number | boolean | undefined };

export interface DocumentTabsProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'aria-label' | 'contextMenu'
> {
  /**
   * The active document, in the panel under the strip, which the active tab joins: anything the
   * application renders, such as an editor or a page, placed as given. Without it, the application
   * renders the panel itself and names it with panelId.
   */
  children?: ReactNode;
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
  /**
   * Id of the panel the active tab controls: the one DocumentTabs renders around children, or the
   * one the application renders itself.
   */
  panelId?: string;
  /**
   * The name of the context menu's item that closes a tab, and the tooltip of its close button,
   * from the tab's text value.
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
  /**
   * The application's own items for the context menu of the tab people open it on, or of the strip
   * around the tabs when the tab is null, such as Close others or Copy path. They come after the
   * built-in items, past a separator.
   */
  contextMenu?: (tab: DocumentTabsItem | null) => ReactNode;
}

/**
 * Editor-style closable tabs for open documents, with the active document in a panel under them.
 * className, style, ref and the other native props go to the root element, which holds the strip
 * of tabs, the actions at its end and the panel.
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
  contextMenu,
  className,
  children,
  ...props
}: DocumentTabsProps) {
  const ownPanelId = useId();
  const tabIdPrefix = useId();
  const hasPanel = children != null && children !== false;
  const controlledPanel = panelId ?? (hasPanel ? ownPanelId : undefined);
  const activeIndex = items.findIndex((item) => item.value === value);
  const tabId = (index: number) => `${tabIdPrefix}-tab-${index}`;
  const messages = useMessages('documentTabs', documentTabs);
  const closeName = closeLabel ?? ((name: string) => messages.close({ label: name }));
  const list = useRef<HTMLDivElement | null>(null);
  const [direction] = useDirection(list);
  const focusable = items.some((item) => item.value === value) ? value : (items[0]?.value ?? null);

  useTabStripScrolling(list, value, items);
  const closeFocus = useTabCloseFocus(list, items, focusable);
  const { drag, onItemPointerDown } = useTabDrag({ list, items, onReorder });

  const dragged = drag ? items.find((item) => item.value === drag.id) : undefined;
  const dropBefore = drag && drag.gap < items.length ? items[drag.gap]?.value : undefined;
  const dropAfter = drag && drag.gap >= items.length ? items.at(-1)?.value : undefined;

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

  function leaveModifiedKeysToApplication(
    event: KeyboardEvent<HTMLDivElement> & { preventBaseUIHandler?: () => void },
  ) {
    const modified = event.altKey || event.ctrlKey || event.metaKey;
    if (modified) event.preventBaseUIHandler?.();
  }

  const strip = (
    <BaseTabs.List
      ref={list}
      aria-label={label}
      activateOnFocus
      render={<Row align="stretch" />}
      className="env-document-tabs-list"
      data-reordering={flag(drag)}
      onKeyDown={leaveModifiedKeysToApplication}
    >
      {items.map((item, index) => (
        <DocumentTab
          key={item.value}
          id={tabId(index)}
          item={item}
          active={item.value === value}
          focusable={item.value === focusable}
          panelId={controlledPanel}
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
        render={<Column align="stretch" />}
        className={classNames('env-document-tabs', className)}
        data-first-active={flag(items[0] !== undefined && items[0].value === value)}
      >
        <Row align="center" className="env-document-tabs-strip">
          <ContextMenu
            aria-label={contextMenuLabel ?? messages.contextMenu}
            onOpenChange={closeFocus.onMenuOpenChange}
            content={(target) => {
              const tab = target
                ?.closest('.env-document-tabs-item')
                ?.querySelector<HTMLElement>('[role="tab"]');
              const id = tab?.dataset.tabId;
              const item = id === undefined ? undefined : items.find((one) => one.value === id);
              const onTab = tab != null && id !== undefined;
              const own = contextMenu?.(item ?? null);
              const ownItems = own != null && own !== false ? own : undefined;
              const offersMenu = onTab || onCloseAll !== undefined;
              if (!offersMenu) return ownItems ?? null;
              return (
                <TabMenuItems
                  tab={
                    onTab
                      ? {
                          id,
                          label: tab.getAttribute('aria-label') ?? '',
                          closable: item?.closable !== false,
                        }
                      : undefined
                  }
                  ownItems={ownItems}
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
            <Slot className="env-document-tabs-end" layout="row" shrink="never">
              {end}
            </Slot>
          )}
        </Row>
        {hasPanel && (
          <div
            className="env-document-tabs-panel"
            id={controlledPanel}
            {...(activeIndex >= 0 && {
              role: 'tabpanel',
              'aria-labelledby': tabId(activeIndex),
              tabIndex: 0,
            })}
          >
            <Slot className="env-document-tabs-panel-content">{children}</Slot>
          </div>
        )}
        {drag && dragged && (
          <div
            className="env-document-tabs-drag-image"
            aria-hidden="true"
            style={{
              left: drag.x + dragImageOffsetFromPointerPx,
              top: drag.y + dragImageOffsetFromPointerPx,
            }}
          >
            {dragged.icon != null && <DecorativeIcon>{dragged.icon}</DecorativeIcon>}
            <span className="env-document-tabs-tab-label">{dragged.label}</span>
          </div>
        )}
      </BaseTabs.Root>
    </DirectionProvider>
  );
}

function closesTab(event: KeyboardEvent<HTMLElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return false;
  if (event.key !== 'Delete' && event.key !== 'Backspace') return false;
  event.preventDefault();
  const heldKeyRepeat = event.repeat;
  return !heldKeyRepeat;
}

const middleButton = 1;

const preventMiddlePressAutoscroll = (event: MouseEvent<HTMLDivElement>) => {
  if (event.button === middleButton) event.preventDefault();
};

function DocumentTab({
  id,
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
  id: string;
  item: DocumentTabsItem;
  active: boolean;
  focusable: boolean;
  closeName: (label: string) => string;
  moving: boolean;
  drop: 'before' | 'after' | undefined;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  const closable = item.closable !== false;
  const labelElement = useRef<HTMLSpanElement>(null);
  const name = useLabelText(item.label, item.textValue, labelElement);
  const {
    className,
    onPointerDown: ownPointerDown,
    onMouseDown: ownMouseDown,
    onAuxClick: ownAuxClick,
    ...itemProps
  } = item.itemProps ?? {};
  return (
    <div
      {...itemProps}
      className={classNames('env-document-tabs-item', className)}
      data-active={flag(active)}
      data-moving={moving ? 'pointer' : undefined}
      data-drop={drop}
      onPointerDown={(event) => {
        ownPointerDown?.(event);
        if (!event.defaultPrevented) onPointerDown(event);
      }}
      onMouseDown={(event) => {
        ownMouseDown?.(event);
        preventMiddlePressAutoscroll(event);
      }}
      onAuxClick={(event) => {
        ownAuxClick?.(event);
        if (event.button !== middleButton || event.defaultPrevented) return;
        event.preventDefault();
        if (closable) onClose(item.value);
      }}
    >
      <BaseTabs.Tab
        id={id}
        value={item.value}
        className="env-document-tabs-tab"
        aria-label={name}
        aria-controls={active ? panelId : undefined}
        aria-keyshortcuts={closable ? 'Delete Backspace' : undefined}
        title={item.tooltip ?? name}
        tabIndex={focusable ? 0 : -1}
        data-tab-id={item.value}
        data-preview={flag(item.preview)}
        onDoubleClick={() => onPin?.(item.value)}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          if (closable && closesTab(event)) onClose(item.value);
        }}
      >
        {item.icon != null && <DecorativeIcon>{item.icon}</DecorativeIcon>}
        <span className="env-document-tabs-tab-label" ref={labelElement}>
          {item.label}
        </span>
        {item.end != null && (
          <Slot className="env-document-tabs-tab-end" element="span" layout="row" shrink="never">
            {item.end}
          </Slot>
        )}
      </BaseTabs.Tab>
      {closable && (
        <IconButton
          variant="ghost"
          icon={<IconClose />}
          aria-label={closeName(name)}
          aria-hidden
          tabIndex={-1}
          title={closeName(name)}
          className="env-document-tabs-close"
          onClick={() => onClose(item.value)}
        />
      )}
    </div>
  );
}

function TabMenuItems({
  tab,
  ownItems,
  closeName,
  onClose,
  onMove,
  canMove,
  closeAll,
  moveLeftLabel,
  moveRightLabel,
}: {
  tab: { id: string; label: string; closable: boolean } | undefined;
  ownItems: ReactNode;
  closeName: (label: string) => string;
  onClose: (id: string) => void;
  onMove: ((id: string, side: 'left' | 'right') => void) | undefined;
  canMove: (id: string, side: 'left' | 'right') => boolean;
  closeAll: { onClick: () => void; label: string; disabled: boolean } | undefined;
  moveLeftLabel: string;
  moveRightLabel: string;
}) {
  return (
    <>
      {tab?.closable && (
        <Menu.Item onClick={() => onClose(tab.id)}>{closeName(tab.label)}</Menu.Item>
      )}
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
      {ownItems !== undefined && (
        <>
          {(tab?.closable || (tab && onMove) || closeAll) && <Menu.Separator />}
          {ownItems}
        </>
      )}
    </>
  );
}
