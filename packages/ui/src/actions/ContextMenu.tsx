'use client';

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useRender } from '@base-ui/react/use-render';
import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type TouchEvent,
} from 'react';
import { MenuPopup, menuParts } from './menu/internal/MenuPopup.js';
import type { OpenChangeDetails, OpenChangeReason } from './menu/internal/menuOpenChange.js';
import {
  containedOpenChange,
  usePortalContainer,
} from '../internal/popup/PortalContainerContext.js';
import { isRightToLeft } from '../internal/dom/direction.js';
import { useControllableState } from '../internal/react/useControllableState.js';

const contextMenuParts = {
  Portal: BaseContextMenu.Portal,
  Positioner: BaseContextMenu.Positioner,
  Popup: BaseContextMenu.Popup,
};

/** What a context menu's onOpenChange receives beside the requested state: a menu's details. */
export type ContextMenuOpenChangeDetails = OpenChangeDetails;

export interface ContextMenuPoint {
  /** Distance from the viewport's left edge in pixels, such as a pointer event's clientX. */
  x: number;
  /** Distance from the viewport's top edge in pixels, such as a pointer event's clientY. */
  y: number;
}

export interface ContextMenuProps {
  /** Accessible name of the menu, such as Document actions. */
  'aria-label': string;
  /**
   * Menu content: Menu.Item, Menu.Group, Menu.Separator and the other menu parts. A function receives
   * the element the menu was opened on: the deepest element under the pointer, or the focused
   * element (its active descendant, when it has one) for the keyboard. Where it returns null,
   * undefined, false or '', the menu doesn't open on that element and the browser keeps its own.
   */
  content: ReactNode | ((target: Element | null) => ReactNode);
  /** One element that becomes the region; it must accept native props and a ref. */
  children: ReactElement;
  /**
   * The region keeps the browser's own context menu.
   * @default false
   */
  disabled?: boolean;
  /** Controlled visibility, for example to open the menu from another control. */
  open?: boolean;
  /** Called with the new visibility, and why, as the menu opens or closes. */
  onOpenChange?: (open: boolean, details: ContextMenuOpenChangeDetails) => void;
  /** Viewport point to open at while controlled; otherwise the menu opens at the pointer. */
  anchorPoint?: ContextMenuPoint;
  /** Class of the menu popup. */
  className?: string;
  /** The menu popup's ref; the region is the element you pass as children. */
  ref?: Ref<HTMLDivElement>;
  /** The menu popup's inline style. */
  style?: CSSProperties;
}

const browserFollowUpToContextMenuKeyWithin = 500;

function isContextMenuKey(event: KeyboardEvent) {
  return event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
}

function offersMenu(content: ContextMenuProps['content'], element: Element | null) {
  const node = contentFor(content, element);
  return node != null && node !== false && node !== '';
}

function contentFor(content: ContextMenuProps['content'], element: Element | null) {
  return typeof content === 'function' ? content(element) : content;
}

function keyboardTarget(event: KeyboardEvent<Element>) {
  const focused = event.target instanceof Element ? event.target : event.currentTarget;
  const descendantId = focused.getAttribute('aria-activedescendant');
  const descendant = descendantId ? focused.ownerDocument.getElementById(descendantId) : null;
  return descendant ?? focused;
}

function pointAnchor(point: ContextMenuPoint) {
  return {
    getBoundingClientRect: () => DOMRect.fromRect({ x: point.x, y: point.y, width: 0, height: 0 }),
  };
}

function pointMovingWithElement(point: ContextMenuPoint, element: Element) {
  const start = element.getBoundingClientRect();
  const [dx, dy] = [point.x - start.left, point.y - start.top];
  return {
    getBoundingClientRect: () => {
      const rect = element.getBoundingClientRect();
      return DOMRect.fromRect({ x: rect.left + dx, y: rect.top + dy, width: 0, height: 0 });
    },
    contextElement: element,
  };
}

const belowAnchorStart = { side: 'bottom', align: 'start', sideOffset: 4 } as const;
const firstRowUnderPointer = { sideOffset: -5, alignOffset: 2 } as const;

function leaveToBrowserContextMenu(
  event: MouseEvent<Element> & { preventBaseUIHandler?: () => void },
) {
  event.preventBaseUIHandler?.();
  stopBaseUiCancellingContextMenu(event);
}

function stopBaseUiCancellingContextMenu(event: MouseEvent<Element>) {
  event.stopPropagation();
}

function anchorBelowStartOf(element: Element) {
  return {
    getBoundingClientRect: () => {
      const rect = element.getBoundingClientRect();
      const rtl = isRightToLeft(element);
      const inset = Math.min(rect.width / 2, 24);
      return DOMRect.fromRect({
        x: rtl ? rect.right - inset : rect.left + inset,
        y: rect.bottom,
        width: 0,
        height: 0,
      });
    },
    contextElement: element,
  };
}

/**
 * Actions for an area, opened by right click, long press, the ContextMenu key or Shift+F10. In a
 * contained PortalContainer, such as a preview of an interface, it is part of the container as its
 * other overlays are: it opens by right click and the keyboard without hiding the page, locking its
 * scroll or taking focus.
 */
export function ContextMenu(props: ContextMenuProps) {
  const { contained } = usePortalContainer();
  return contained ? <ContainedContextMenu {...props} /> : <WindowContextMenu {...props} />;
}

function WindowContextMenu({
  'aria-label': label,
  content,
  children,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  anchorPoint,
  className,
  ref,
  style,
}: ContextMenuProps) {
  const [open, setOpenState] = useControllableState({
    value: controlledOpen,
    defaultValue: false,
    onChange: onOpenChange,
  });
  const portal = usePortalContainer();
  const [target, setTarget] = useState<Element | null>(null);
  const [keyboardAnchor, setKeyboardAnchor] = useState<ReturnType<
    typeof anchorBelowStartOf
  > | null>(null);
  const keyboardOpenedAt = useRef(Number.NEGATIVE_INFINITY);
  const region = useRef<HTMLDivElement>(null);

  function setOpen(next: boolean, reason: OpenChangeReason = 'trigger-press') {
    if (!next) keyboardOpenedAt.current = Number.NEGATIVE_INFINITY;
    setOpenState(next, { reason });
  }

  function openAtPointer(event: MouseEvent<Element> & { preventBaseUIHandler?: () => void }) {
    if (disabled) return;
    const browserFollowUpToContextMenuKey =
      performance.now() - keyboardOpenedAt.current < browserFollowUpToContextMenuKeyWithin;
    if (browserFollowUpToContextMenuKey) {
      event.preventDefault();
      event.preventBaseUIHandler?.();
      return;
    }
    const element = event.target instanceof Element ? event.target : null;
    if (!offersMenu(content, element)) {
      leaveToBrowserContextMenu(event);
      return;
    }
    setTarget(element);
    setKeyboardAnchor(null);
  }

  function skipLongPressTimerWhereNoMenu(
    event: TouchEvent<Element> & { preventBaseUIHandler?: () => void },
  ) {
    if (disabled) return;
    if (!offersMenu(content, event.target instanceof Element ? event.target : null))
      event.preventBaseUIHandler?.();
  }

  function takeTargetAsTouchPressStarts(event: PointerEvent<Element>) {
    if (disabled || event.pointerType === 'mouse') return;
    setTarget(event.target instanceof Element ? event.target : null);
    setKeyboardAnchor(null);
  }

  function openFromKeyboard(event: KeyboardEvent<Element>) {
    if (disabled || !isContextMenuKey(event)) return;
    const element = keyboardTarget(event);
    if (!offersMenu(content, element)) return;
    event.preventDefault();
    keyboardOpenedAt.current = performance.now();
    setTarget(element);
    setKeyboardAnchor(anchorBelowStartOf(element));
    setOpen(true);
  }

  const anchor =
    controlledOpen !== undefined && anchorPoint ? pointAnchor(anchorPoint) : keyboardAnchor;
  return (
    <BaseContextMenu.Root
      open={open}
      onOpenChange={containedOpenChange(portal, region, (next, details) =>
        setOpen(next, details.reason),
      )}
      disabled={disabled}
    >
      <BaseContextMenu.Trigger
        ref={region}
        render={children}
        onContextMenu={openAtPointer}
        onPointerDown={takeTargetAsTouchPressStarts}
        onTouchStart={skipLongPressTimerWhereNoMenu}
        onKeyDown={openFromKeyboard}
      />
      <MenuPopup
        parts={contextMenuParts}
        label={label}
        trigger={region}
        {...(anchor ? { anchor, ...belowAnchorStart } : firstRowUnderPointer)}
        className={className}
        popupRef={ref}
        popupProps={{ style }}
      >
        {contentFor(content, target)}
      </MenuPopup>
    </BaseContextMenu.Root>
  );
}

function ContainedContextMenu({
  'aria-label': label,
  content,
  children,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  anchorPoint,
  className,
  ref,
  style,
}: ContextMenuProps) {
  const portal = usePortalContainer();
  const [open, setOpenState] = useControllableState({
    value: controlledOpen,
    defaultValue: false,
    onChange: onOpenChange,
  });
  const [target, setTarget] = useState<Element | null>(null);
  const [anchor, setAnchor] = useState<{
    at: ReturnType<typeof pointMovingWithElement> | ReturnType<typeof anchorBelowStartOf>;
    pointer: boolean;
  } | null>(null);
  const region = useRef<HTMLElement>(null);

  function setOpen(next: boolean, reason: OpenChangeReason = 'trigger-press') {
    setOpenState(next, { reason });
  }

  function openAtPointer(event: MouseEvent<Element>) {
    if (disabled) return;
    const element = event.target instanceof Element ? event.target : null;
    if (!offersMenu(content, element)) return;
    event.preventDefault();
    setTarget(element);
    setAnchor({
      at: pointMovingWithElement(
        { x: event.clientX, y: event.clientY },
        element ?? event.currentTarget,
      ),
      pointer: true,
    });
    setOpen(true);
  }

  function openFromKeyboard(event: KeyboardEvent<Element>) {
    if (disabled || !isContextMenuKey(event)) return;
    const element = keyboardTarget(event);
    if (!offersMenu(content, element)) return;
    event.preventDefault();
    setTarget(element);
    setAnchor({ at: anchorBelowStartOf(element), pointer: false });
    setOpen(true);
  }

  const regionElement = useRender({
    render: children,
    ref: region,
    props: { onContextMenu: openAtPointer, onKeyDown: openFromKeyboard },
  });
  const controlledAnchor = controlledOpen !== undefined && anchorPoint !== undefined;
  const { x, y } = anchorPoint ?? { x: 0, y: 0 };
  const givenAnchor = useMemo(
    () =>
      controlledAnchor
        ? region.current
          ? pointMovingWithElement({ x, y }, region.current)
          : pointAnchor({ x, y })
        : null,
    [controlledAnchor, x, y],
  );
  const at = givenAnchor ?? anchor?.at;
  const openedAtPointer = !controlledAnchor && anchor?.pointer;
  return (
    <BaseMenu.Root
      open={open && !disabled}
      modal={false}
      onOpenChange={containedOpenChange(portal, region, (next, details) =>
        setOpen(next, details.reason),
      )}
    >
      {regionElement}
      <MenuPopup
        parts={menuParts}
        label={label}
        trigger={region}
        anchor={at}
        side={belowAnchorStart.side}
        align={belowAnchorStart.align}
        sideOffset={openedAtPointer ? firstRowUnderPointer.sideOffset : belowAnchorStart.sideOffset}
        alignOffset={openedAtPointer ? firstRowUnderPointer.alignOffset : 0}
        className={className}
        popupRef={ref}
        popupProps={{ style }}
      >
        {contentFor(content, target)}
      </MenuPopup>
    </BaseMenu.Root>
  );
}
