'use client';

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useRender } from '@base-ui/react/use-render';
import {
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
import { MenuPopup } from './internal/MenuPopup.js';
import { keepsOpen, usePortalContainer } from '../internal/PortalContainerContext.js';
import { isRightToLeft } from '../internal/direction.js';

/** The Base UI parts of a context menu's popup. */
const contextMenuParts = {
  Portal: BaseContextMenu.Portal,
  Positioner: BaseContextMenu.Positioner,
  Popup: BaseContextMenu.Popup,
};

/** The Base UI parts of a contained context menu's popup: a menu's, which needn't be modal. */
const containedMenuParts = {
  Portal: BaseMenu.Portal,
  Positioner: BaseMenu.Positioner,
  Popup: BaseMenu.Popup,
};

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
  /** The region keeps the browser's own context menu. */
  disabled?: boolean;
  /** Controlled visibility, for example to open the menu from another control. */
  open?: boolean;
  /** Called with the new visibility as the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Viewport point to open at while controlled; otherwise the menu opens at the pointer. */
  anchorPoint?: ContextMenuPoint;
  /** Class of the menu popup. */
  className?: string;
  /** The menu popup's ref; the region is the element you pass as children. */
  ref?: Ref<HTMLDivElement>;
  /** The menu popup's inline style. */
  style?: CSSProperties;
}

/** A browser context-menu key event: the ContextMenu key or Shift+F10. */
function isContextMenuKey(event: KeyboardEvent) {
  return event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
}

function pointAnchor(point: ContextMenuPoint) {
  return {
    getBoundingClientRect: () => DOMRect.fromRect({ x: point.x, y: point.y, width: 0, height: 0 }),
  };
}

/** The keyboard opens the menu below the start of the target, which stays the anchor while it moves. */
function elementAnchor(element: Element) {
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

/** A context menu over the window: modal, as Base UI's is. */
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
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const portal = usePortalContainer();
  const open = controlledOpen ?? uncontrolledOpen;
  const [target, setTarget] = useState<Element | null>(null);
  const [keyboardAnchor, setKeyboardAnchor] = useState<ReturnType<typeof elementAnchor> | null>(
    null,
  );
  // Browsers may follow a context-menu key with their own contextmenu event; it must not reopen
  // the menu at the pointer.
  const keyboardOpenedAt = useRef(Number.NEGATIVE_INFINITY);
  const region = useRef<HTMLDivElement>(null);
  // Content that renders nothing, such as null, undefined, false or '', offers no menu: a content
  // function returning it for an element offers none there.
  const offersMenu = (element: Element | null) => {
    const node = typeof content === 'function' ? content(element) : content;
    return node != null && node !== false && node !== '';
  };

  function setOpen(next: boolean) {
    if (!next) keyboardOpenedAt.current = Number.NEGATIVE_INFINITY;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  function openAtPointer(event: MouseEvent<Element> & { preventBaseUIHandler?: () => void }) {
    if (disabled) return;
    if (performance.now() - keyboardOpenedAt.current < 500) {
      event.preventDefault();
      event.preventBaseUIHandler?.();
      return;
    }
    const element = event.target instanceof Element ? event.target : null;
    if (!offersMenu(element)) {
      // Where no menu is offered, the browser keeps its own. Base UI's trigger also cancels every
      // contextmenu event inside the region from a listener on the document, so the event stops
      // here, before it leaves React's root. Listeners of the application's own on the document
      // don't see it either. Base UI's -webkit-touch-callout: none still applies to the whole
      // region, so a long press there shows no callout on iOS.
      event.preventBaseUIHandler?.();
      event.stopPropagation();
      return;
    }
    setTarget(element);
    setKeyboardAnchor(null);
  }

  // A long press where no menu is offered starts no timer to open one.
  function checkTouch(event: TouchEvent<Element> & { preventBaseUIHandler?: () => void }) {
    if (disabled) return;
    if (!offersMenu(event.target instanceof Element ? event.target : null))
      event.preventBaseUIHandler?.();
  }

  // A touch long press can open the menu through Base UI without a contextmenu event, so the
  // pressed element is taken as the press starts.
  function notePress(event: PointerEvent<Element>) {
    if (disabled || event.pointerType === 'mouse') return;
    setTarget(event.target instanceof Element ? event.target : null);
    setKeyboardAnchor(null);
  }

  function openFromKeyboard(event: KeyboardEvent<Element>) {
    if (disabled || !isContextMenuKey(event)) return;
    const focused = event.target instanceof Element ? event.target : event.currentTarget;
    const descendantId = focused.getAttribute('aria-activedescendant');
    const descendant = descendantId ? focused.ownerDocument.getElementById(descendantId) : null;
    const element = descendant ?? focused;
    if (!offersMenu(element)) return;
    event.preventDefault();
    keyboardOpenedAt.current = performance.now();
    setTarget(element);
    setKeyboardAnchor(elementAnchor(element));
    setOpen(true);
  }

  const anchor =
    controlledOpen !== undefined && anchorPoint ? pointAnchor(anchorPoint) : keyboardAnchor;
  return (
    <BaseContextMenu.Root
      open={open}
      onOpenChange={(next, details) => {
        if (keepsOpen(portal, next, details, region.current)) details.cancel();
        else setOpen(next);
      }}
      disabled={disabled}
    >
      <BaseContextMenu.Trigger
        ref={region}
        render={children}
        onContextMenu={openAtPointer}
        onPointerDown={notePress}
        onTouchStart={checkTouch}
        onKeyDown={openFromKeyboard}
      />
      <MenuPopup
        parts={contextMenuParts}
        label={label}
        trigger={region}
        // At a point or an element the menu opens below its start; at the pointer, Base UI's own
        // placement puts its first row under the pointer.
        {...(anchor
          ? { anchor, side: 'bottom', align: 'start', sideOffset: 4 }
          : { sideOffset: -5, alignOffset: 2 })}
        className={className}
        popupRef={ref}
        popupProps={{ style }}
      >
        {typeof content === 'function' ? content(target) : content}
      </MenuPopup>
    </BaseContextMenu.Root>
  );
}

/**
 * A context menu in a contained PortalContainer. Base UI's context menu is always modal, which
 * would hide the page and lock its scroll for a menu in a preview; this one is a menu that isn't
 * modal, opened at the pointer or below the focused element as the context menu is.
 */
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
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const [target, setTarget] = useState<Element | null>(null);
  const [anchor, setAnchor] = useState<{
    at: ReturnType<typeof pointAnchor> | ReturnType<typeof elementAnchor>;
    pointer: boolean;
  } | null>(null);
  const region = useRef<HTMLElement>(null);
  const offersMenu = (element: Element | null) => {
    const node = typeof content === 'function' ? content(element) : content;
    return node != null && node !== false && node !== '';
  };

  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  function openAtPointer(event: MouseEvent<Element>) {
    if (disabled) return;
    const element = event.target instanceof Element ? event.target : null;
    // Where no menu is offered, the browser keeps its own.
    if (!offersMenu(element)) return;
    event.preventDefault();
    setTarget(element);
    setAnchor({ at: pointAnchor({ x: event.clientX, y: event.clientY }), pointer: true });
    setOpen(true);
  }

  function openFromKeyboard(event: KeyboardEvent<Element>) {
    if (disabled || !isContextMenuKey(event)) return;
    const focused = event.target instanceof Element ? event.target : event.currentTarget;
    const descendantId = focused.getAttribute('aria-activedescendant');
    const descendant = descendantId ? focused.ownerDocument.getElementById(descendantId) : null;
    const element = descendant ?? focused;
    if (!offersMenu(element)) return;
    event.preventDefault();
    setTarget(element);
    setAnchor({ at: elementAnchor(element), pointer: false });
    setOpen(true);
  }

  const regionElement = useRender({
    render: children,
    ref: region,
    props: { onContextMenu: openAtPointer, onKeyDown: openFromKeyboard },
  });
  const controlledAnchor = controlledOpen !== undefined && anchorPoint;
  const at = controlledAnchor ? pointAnchor(anchorPoint) : anchor?.at;
  // At the pointer its first row is under the pointer, as Base UI places a context menu; at a
  // point or an element it opens below its start.
  const pointer = !controlledAnchor && anchor?.pointer;
  return (
    <BaseMenu.Root
      open={open && !disabled}
      modal={false}
      onOpenChange={(next, details) => {
        if (keepsOpen(portal, next, details, region.current)) details.cancel();
        else setOpen(next);
      }}
    >
      {regionElement}
      <MenuPopup
        parts={containedMenuParts}
        label={label}
        trigger={region}
        anchor={at}
        side="bottom"
        align="start"
        sideOffset={pointer ? -5 : 4}
        alignOffset={pointer ? 2 : 0}
        className={className}
        popupRef={ref}
        popupProps={{ style }}
      >
        {typeof content === 'function' ? content(target) : content}
      </MenuPopup>
    </BaseMenu.Root>
  );
}
