import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';
import { classNames } from '../../internal/classNames.js';
import { Grid } from '../../foundations/Layout.js';
import {
  PopupSurface,
  type PopupAlign,
  type PopupParts,
  type PopupSide,
  type PopupSurfaceProps,
} from '../../internal/PopupSurface.js';

/**
 * Renders a menu popup element with, when given, its own name. Base UI names a menu after its
 * trigger; a label replaces that name.
 */
export function renderMenuPopup(label: string | undefined) {
  return function renderPopup(props: ComponentPropsWithRef<'div'>) {
    return (
      <Grid
        padding={1}
        {...props}
        aria-labelledby={label === undefined ? props['aria-labelledby'] : undefined}
        aria-label={label}
      />
    );
  };
}

export interface MenuPopupProps {
  /** The Base UI parts of the menu: Menu's or ContextMenu's Portal, Positioner and Popup. */
  parts: PopupParts;
  /** The menu's accessible name, in place of its trigger's. */
  label?: string;
  side?: PopupSide;
  align?: PopupAlign;
  sideOffset?: PopupSurfaceProps['sideOffset'];
  alignOffset?: PopupSurfaceProps['alignOffset'];
  anchor?: PopupSurfaceProps['anchor'];
  /** The menu's trigger, whose text direction the menu takes as it opens. */
  trigger?: PopupSurfaceProps['trigger'];
  finalFocus?: PopupSurfaceProps['finalFocus'];
  /** The application's class for the popup, beside env-menu. */
  className?: string;
  /** The popup element's ref. */
  popupRef?: Ref<HTMLDivElement>;
  /** More props for the popup element, such as style and data attributes. */
  popupProps?: Record<string, unknown>;
  skeleton?: boolean;
  children?: ReactNode;
}

/**
 * The popup of every envUI menu (Menu.Root, Menu.Submenu, ContextMenu and Menubar.Menu): a
 * PopupSurface with the menu's own look, env-menu, and its own name.
 */
export function MenuPopup({
  parts,
  label,
  side,
  align,
  sideOffset,
  alignOffset,
  anchor,
  trigger,
  finalFocus,
  className,
  popupRef,
  popupProps,
  skeleton,
  children,
}: MenuPopupProps) {
  return (
    <PopupSurface
      parts={parts}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      // Base UI's own room from the window's edges for menus.
      collisionPadding={5}
      anchor={anchor}
      trigger={trigger}
      finalFocus={finalFocus}
      className={classNames('env-menu', className)}
      positionerClassName="env-menu-positioner"
      popupProps={{ ...popupProps, ref: popupRef, render: renderMenuPopup(label) }}
      skeleton={skeleton}
    >
      {children}
    </PopupSurface>
  );
}

/** Padding and border between a menu popup's block-start edge and its first row, in pixels. */
export function menuPopupInset(element: Element | null | undefined) {
  if (!element) return 0;
  const style = getComputedStyle(element);
  return (
    (Number.parseFloat(style.paddingBlockStart) || 0) +
    (Number.parseFloat(style.borderBlockStartWidth) || 0)
  );
}

/** Padding and border between a menu popup's inline-end edge and its rows, in pixels. */
export function menuPopupInlineInset(element: Element | null | undefined) {
  if (!element) return 0;
  const style = getComputedStyle(element);
  return (
    (Number.parseFloat(style.paddingInlineEnd) || 0) +
    (Number.parseFloat(style.borderInlineEndWidth) || 0)
  );
}
