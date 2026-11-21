'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useRef, type CSSProperties, type ReactNode, type Ref } from 'react';
import { IconChevronRight } from '../../icons/ChevronRight.js';
import { mergeRefs } from '../../internal/react/setRef.js';
import { usePortalContainer } from '../../internal/provider/PortalContainerContext.js';
import { containedOpenChange } from '../../internal/popup/containedOverlays.js';
import { MenuPopup, menuParts, menuPopupInset } from './internal/MenuPopup.js';
import type { OpenChangeDetails } from './internal/menuOpenChange.js';
import { useMenuItemContent, type ItemContentProps } from './MenuItem.js';
import type { TriggerProps } from './internal/menuTriggerProps.js';
import { classNames } from '../../internal/classNames.js';
import { DecorativeIcon } from '../../internal/icon/DecorativeIcon.js';
import '../../styles/Base.css';
import '../../styles/Menu.css';

export interface SubmenuProps extends Omit<ItemContentProps, 'children' | 'shortcut'> {
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
  /**
   * Attributes of the row that opens the submenu, such as a className, a style, a ref or a data
   * attribute; the submenu's own className, style and ref are its popup's.
   */
  triggerProps?: TriggerProps;
}

const gapFromParentMenuEdge = 2;
const reasonsClosingOnlyTheSubmenu = new Set(['escape-key', 'list-navigation']);

/**
 * A row that opens a nested menu beside it, on hover or with the keyboard. The submenu opens in the
 * theme of its menu, and lines its first row up with the row that opened it.
 */
export function Submenu({
  label,
  textValue,
  start,
  description,
  end,
  children,
  'aria-label': ariaLabel,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ref,
  style,
  triggerProps,
}: SubmenuProps) {
  const trigger = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const closeReason = useRef<string | null>(null);
  const { content, accessibility } = useMenuItemContent({
    start,
    children: label,
    textValue,
    description,
    end,
    'aria-describedby': triggerProps?.['aria-describedby'],
  });
  const textLabel = typeof label === 'string' ? label : undefined;
  const portal = usePortalContainer();
  const clearParentMenuEdge = () =>
    menuPopupInset(trigger.current?.closest('.env-menu'), 'inline-end') + gapFromParentMenuEdge;
  const alignFirstRowWithOpeningRow = () => -menuPopupInset(popup.current, 'block-start');
  const returnFocusToOpeningRowIfStillThere = () => {
    const row = trigger.current;
    const active = row?.ownerDocument.activeElement;
    const focusFellToBodyAsSubmenuWent = active === row?.ownerDocument.body;
    const focusStillOnRowOrSubmenu =
      active == null ||
      active === row ||
      focusFellToBodyAsSubmenuWent ||
      popup.current?.contains(active) === true;
    const closedOnlyTheSubmenu = reasonsClosingOnlyTheSubmenu.has(closeReason.current ?? '');
    return closedOnlyTheSubmenu && focusStillOnRowOrSubmenu ? (row ?? false) : false;
  };
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
        {...triggerProps}
        ref={mergeRefs(trigger, triggerProps?.ref)}
        className={classNames('env-menu-item env-menu-submenu-trigger', triggerProps?.className)}
        disabled={disabled}
        {...accessibility}
      >
        {content}
        <DecorativeIcon className="env-menu-submenu-chevron">
          <IconChevronRight />
        </DecorativeIcon>
      </BaseMenu.SubmenuTrigger>
      <MenuPopup
        parts={menuParts}
        label={ariaLabel ?? textLabel}
        side="inline-end"
        align="start"
        sideOffset={clearParentMenuEdge}
        alignOffset={alignFirstRowWithOpeningRow}
        trigger={trigger}
        finalFocus={returnFocusToOpeningRowIfStillThere}
        className={className}
        popupRef={mergeRefs(popup, ref)}
        popupProps={{ style }}
      >
        {children}
      </MenuPopup>
    </BaseMenu.SubmenuRoot>
  );
}
