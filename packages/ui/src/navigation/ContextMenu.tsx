'use client';

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
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
} from 'react';
import { MenuPopup } from './internal/MenuPopup.js';

/** The Base UI parts of a context menu's popup. */
const contextMenuParts = {
  Portal: BaseContextMenu.Portal,
  Positioner: BaseContextMenu.Positioner,
  Popup: BaseContextMenu.Popup,
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
   * element (its active descendant, when it has one) for the keyboard.
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
      const rtl = getComputedStyle(element).direction === 'rtl';
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

/** Actions for an area, opened by right click, long press, the ContextMenu key or Shift+F10. */
export function ContextMenu({
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
  const open = controlledOpen ?? uncontrolledOpen;
  const [target, setTarget] = useState<Element | null>(null);
  const [keyboardAnchor, setKeyboardAnchor] = useState<ReturnType<typeof elementAnchor> | null>(
    null,
  );
  // Browsers may follow a context-menu key with their own contextmenu event; it must not reopen
  // the menu at the pointer.
  const keyboardOpenedAt = useRef(Number.NEGATIVE_INFINITY);

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
    setTarget(event.target instanceof Element ? event.target : null);
    setKeyboardAnchor(null);
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
    event.preventDefault();
    const focused = event.target instanceof Element ? event.target : event.currentTarget;
    const descendantId = focused.getAttribute('aria-activedescendant');
    const descendant = descendantId ? focused.ownerDocument.getElementById(descendantId) : null;
    const element = descendant ?? focused;
    keyboardOpenedAt.current = performance.now();
    setTarget(element);
    setKeyboardAnchor(elementAnchor(element));
    setOpen(true);
  }

  const anchor =
    controlledOpen !== undefined && anchorPoint ? pointAnchor(anchorPoint) : keyboardAnchor;
  return (
    <BaseContextMenu.Root open={open} onOpenChange={(next) => setOpen(next)} disabled={disabled}>
      <BaseContextMenu.Trigger
        render={children}
        onContextMenu={openAtPointer}
        onPointerDown={notePress}
        onKeyDown={openFromKeyboard}
      />
      <MenuPopup
        parts={contextMenuParts}
        label={label}
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
