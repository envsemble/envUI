'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';
import { classNames } from '../../internal/classNames.js';
import { Grid } from '../../layout/Layout.js';
import {
  PopupSurface,
  type PopupAlign,
  type PopupElementProps,
  type PopupParts,
  type PopupSide,
  type PopupSurfaceProps,
} from '../../internal/popup/PopupSurface.js';
import { pixelsOf } from '../../internal/dom/lengths.js';
import '../../styles/Base.css';
import '../../styles/Menu.css';

export const menuParts = {
  Portal: BaseMenu.Portal,
  Positioner: BaseMenu.Positioner,
  Popup: BaseMenu.Popup,
};

function renderPopupNamedByLabelOverTrigger(label: string | undefined) {
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

const baseUIMenuCollisionPadding = 5;

export interface MenuPopupProps {
  parts: PopupParts;
  label?: string;
  side?: PopupSide;
  align?: PopupAlign;
  sideOffset?: PopupSurfaceProps['sideOffset'];
  alignOffset?: PopupSurfaceProps['alignOffset'];
  anchor?: PopupSurfaceProps['anchor'];
  trigger?: PopupSurfaceProps['trigger'];
  finalFocus?: PopupSurfaceProps['finalFocus'];
  className?: string;
  popupRef?: Ref<HTMLDivElement>;
  popupProps?: PopupElementProps;
  skeleton?: boolean;
  children?: ReactNode;
}

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
      collisionPadding={baseUIMenuCollisionPadding}
      anchor={anchor}
      trigger={trigger}
      finalFocus={finalFocus}
      className={classNames('env-menu', className)}
      positionerClassName="env-menu-positioner"
      popupProps={{
        ...popupProps,
        ref: popupRef,
        render: renderPopupNamedByLabelOverTrigger(label),
      }}
      skeleton={skeleton}
    >
      {children}
    </PopupSurface>
  );
}

export function menuPopupInset(
  element: Element | null | undefined,
  side: 'block-start' | 'inline-end',
) {
  if (!element) return 0;
  const style = getComputedStyle(element);
  return (
    pixelsOf(style.getPropertyValue(`padding-${side}`)) +
    pixelsOf(style.getPropertyValue(`border-${side}-width`))
  );
}
