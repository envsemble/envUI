'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import {
  useId,
  useRef,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Column, Row } from '../layout/Layout.js';
import { Slot } from '../internal/layout/Slot.js';
import { useDirection } from '../internal/provider/useDirection.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { documentTabs } from '../foundations/messages/documentTabs.js';
import { ContextMenu } from '../actions/ContextMenu.js';
import { DocumentTab } from './internal/documentTabs/DocumentTab.js';
import { tabMenuContent } from './internal/documentTabs/tabMenuContent.js';
import { moveValue } from './internal/documentTabs/tabStrip.js';
import { useTabCloseFocus } from './internal/documentTabs/useTabCloseFocus.js';
import { useTabDrag } from './internal/documentTabs/useTabDrag.js';
import { useTabStripScrolling } from './internal/documentTabs/useTabStripScrolling.js';
import { flag } from '../internal/flag.js';
import { rendersContent } from '../internal/react/rendersContent.js';
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
  /**
   * Content before the tab's name, such as a file type's icon: an envUI icon takes the control icon
   * size and other content keeps its own. It is left out of the tab's name, which the label gives.
   */
  start?: ReactNode;
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
   * className or data attributes for tests. Its class joins the tab's. Its onPointerDown,
   * onMouseDown and onAuxClick run before the tab's own, where preventDefault in onPointerDown or
   * onAuxClick stops the tab's drag or middle-click close; its other handlers run after the tab's
   * own, on the element around the tab.
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
  onClose: (value: string) => void;
  /** Called when a tab is double-clicked, typically to keep a preview tab open. */
  onPin?: (value: string) => void;
  /**
   * Called with every tab's value in the new order when a tab is dragged to another place with a
   * mouse or pen, or moved with Move left or Move right in its context menu, which also reach
   * the keyboard and touch. Without it, the tabs keep their order.
   */
  onReorder?: (values: string[]) => void;
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
  const tabElementIdPrefix = useId();
  const hasPanel = rendersContent(children);
  const controlledPanel = panelId ?? (hasPanel ? ownPanelId : undefined);
  const activeIndex = items.findIndex((item) => item.value === value);
  const tabElementId = (index: number) => `${tabElementIdPrefix}-tab-${index}`;
  const messages = useMessages('documentTabs', documentTabs);
  const closeName = closeLabel ?? ((name: string) => messages.close({ label: name }));
  const list = useRef<HTMLDivElement | null>(null);
  const [direction] = useDirection(list);
  const focusable = items.some((item) => item.value === value) ? value : (items[0]?.value ?? null);

  useTabStripScrolling(list, value, items);
  const closeFocus = useTabCloseFocus(list, items, focusable);
  const { drag, onItemPointerDown } = useTabDrag({ list, items, onReorder });

  const dragged = drag ? items.find((item) => item.value === drag.value) : undefined;
  const dropBefore = drag && drag.gap < items.length ? items[drag.gap]?.value : undefined;
  const dropAfter = drag && drag.gap >= items.length ? items.at(-1)?.value : undefined;

  function moveTarget(value: string, side: 'left' | 'right') {
    const index = items.findIndex((item) => item.value === value);
    const target = index + ((side === 'right') !== (direction === 'rtl') ? 1 : -1);
    return index < 0 || target < 0 || target >= items.length ? -1 : target;
  }

  function moveTab(value: string, side: 'left' | 'right') {
    const target = moveTarget(value, side);
    if (target < 0) return;
    onReorder?.(
      moveValue(
        items.map((item) => item.value),
        value,
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
          id={tabElementId(index)}
          item={item}
          active={item.value === value}
          focusable={item.value === focusable}
          panelId={controlledPanel}
          closeName={closeName}
          moving={drag?.value === item.value}
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
            content={(target) =>
              tabMenuContent(target, {
                items,
                contextMenu,
                closeName,
                onClose: (closed) => {
                  closeFocus.onCloseFromMenu();
                  onClose(closed);
                },
                onMove: onReorder && moveTab,
                canMove: (moved, side) => moveTarget(moved, side) >= 0,
                closeAll: onCloseAll && {
                  onClick: onCloseAll,
                  label: closeAllLabel ?? messages.closeAll,
                  disabled: items.length === 0,
                },
                moveLeftLabel: messages.moveLeft,
                moveRightLabel: messages.moveRight,
              })
            }
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
              'aria-labelledby': tabElementId(activeIndex),
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
            {dragged.start != null && (
              <Slot
                className="env-document-tabs-tab-start"
                element="span"
                layout="row"
                shrink="never"
              >
                {dragged.start}
              </Slot>
            )}
            <span className="env-document-tabs-tab-label">{dragged.label}</span>
          </div>
        )}
      </BaseTabs.Root>
    </DirectionProvider>
  );
}
