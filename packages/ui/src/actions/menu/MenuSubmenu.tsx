'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useRef, type CSSProperties, type ReactNode, type Ref } from 'react';
import { IconChevronRight } from '../../icons/ChevronRight.js';
import { setRef } from '../../internal/react/setRef.js';
import {
  containedOpenChange,
  usePortalContainer,
} from '../../internal/popup/PortalContainerContext.js';
import {
  MenuPopup,
  menuParts,
  menuPopupInlineInset,
  menuPopupInset,
} from '../internal/MenuPopup.js';
import type { OpenChangeDetails } from '../internal/menuOpenChange.js';
import { useMenuItemContent, type ItemContentProps } from './MenuItem.js';
import '../../styles/Base.css';
import '../../styles/Menu.css';

export interface SubmenuProps extends Omit<ItemContentProps, 'children' | 'shortcut' | 'end'> {
  /** The label of the row that opens the submenu, which names the row. */
  label: ReactNode;
  /** The submenu's items: Menu.Item, Menu.Group, Menu.Separator and the other parts, nested submenus too. */
  children: ReactNode;
  /** Accessible name of the submenu; by default the label, when it is a string. */
  'aria-label'?: string;
  /**
   * The row stays in place, dimmed, but cannot open its submenu.
   * @default false
   */
  disabled?: boolean;
  /** Controlled visibility; onOpenChange also suits loading the items as the submenu opens. */
  open?: boolean;
  /**
   * Whether an uncontrolled submenu starts open.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called with the new visibility, and why, as the submenu opens or closes, for example to load
   * its items.
   */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /** Class of the submenu popup. */
  className?: string;
  /** The submenu popup's ref. */
  ref?: Ref<HTMLDivElement>;
  /** The submenu popup's inline style. */
  style?: CSSProperties;
}

/** Gap between a submenu and the edge of the menu it opens from, in pixels. */
const submenuGap = 2;
/** Ways of closing only the submenu, after which focus returns to the row that opened it. */
const submenuReturnReasons = new Set(['escape-key', 'list-navigation']);

/**
 * A row that opens a nested menu beside it, on hover or with the keyboard. The submenu opens in the
 * theme of its menu, and lines its first row up with the row that opened it.
 */
export function Submenu({
  label,
  icon,
  description,
  children,
  'aria-label': ariaLabel,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ref,
  style,
}: SubmenuProps) {
  const trigger = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const closeReason = useRef<string | null>(null);
  const { content, accessibility } = useMenuItemContent({ icon, children: label, description });
  const textLabel = typeof label === 'string' ? label : undefined;
  const portal = usePortalContainer();
  return (
    <BaseMenu.SubmenuRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={containedOpenChange(portal, trigger, (next, details) => {
        closeReason.current = next ? null : details.reason;
        onOpenChange?.(next, { reason: details.reason });
      })}
    >
      <BaseMenu.SubmenuTrigger
        ref={trigger}
        className="env-menu-item env-menu-submenu-trigger"
        disabled={disabled}
        label={textLabel}
        {...accessibility}
      >
        {content}
        <span className="env-icon env-menu-submenu-chevron" aria-hidden="true">
          <IconChevronRight />
        </span>
      </BaseMenu.SubmenuTrigger>
      <MenuPopup
        parts={menuParts}
        label={ariaLabel ?? textLabel}
        side="inline-end"
        align="start"
        // The submenu clears the edge of its menu by a small gap, and its first row lines up with
        // the row that opened it. Collisions flip it to the other side.
        sideOffset={() => menuPopupInlineInset(trigger.current?.closest('.env-menu')) + submenuGap}
        alignOffset={() => -menuPopupInset(popup.current)}
        trigger={trigger}
        // Escape and ← close only the submenu and return to its row, while focus is still in the
        // submenu or on the row: it runs as the submenu starts to close and again once it has gone,
        // when focus may have moved on in the menu. Otherwise focus has moved on, or an item closed
        // the whole menu, whose own trigger takes focus.
        finalFocus={() => {
          const row = trigger.current;
          const active = row?.ownerDocument.activeElement;
          // Focus in a submenu that has gone falls to the body.
          const focusHere =
            active == null ||
            active === row ||
            active === row?.ownerDocument.body ||
            popup.current?.contains(active) === true;
          return submenuReturnReasons.has(closeReason.current ?? '') && focusHere
            ? (row ?? false)
            : false;
        }}
        className={className}
        popupRef={(node: HTMLDivElement | null) => {
          popup.current = node;
          setRef(ref, node);
        }}
        popupProps={{ style }}
      >
        {children}
      </MenuPopup>
    </BaseMenu.SubmenuRoot>
  );
}
