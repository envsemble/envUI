'use client';

import { createContext, type ComponentPropsWithRef } from 'react';

export type MenuPopupDensity = 'standard' | 'compact';

/** The density of the menu a part renders in: a submenu opens in the density of its menu. */
export const MenuDensityContext = createContext<MenuPopupDensity>('standard');

/**
 * Renders a menu popup element with its density and, when given, its own name. Base UI names a menu
 * after its trigger; a label replaces that name.
 */
export function renderMenuPopup(label: string | undefined, density: MenuPopupDensity) {
  return function renderPopup(props: ComponentPropsWithRef<'div'>) {
    return (
      <div
        {...props}
        aria-labelledby={label === undefined ? props['aria-labelledby'] : undefined}
        aria-label={label}
        data-density={density === 'compact' ? 'compact' : undefined}
      />
    );
  };
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
