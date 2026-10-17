'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Drawer } from '../../feedback/Drawer.js';
import type { DialogOpenChangeReason } from '../../feedback/Dialog.js';
import { classNames } from '../../internal/classNames.js';
import type { FrameStore, SidebarChangeReason } from '../app-shell/FrameStore.js';
import type { SidebarSide } from '../app-shell/persistence.js';

const reasons: Partial<Record<DialogOpenChangeReason, SidebarChangeReason>> = {
  'escape-key': 'escape',
  'outside-press': 'outside-press',
  'close-press': 'trigger',
  'trigger-press': 'trigger',
};

/** The elements that take Tab, to find the same control in the inline sidebar after widening. */
export const tabbable =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface SidebarDrawerProps {
  store: FrameStore;
  side: SidebarSide;
  id: string;
  label: string;
  /** The landmark element inside the drawer: nav, aside or div. */
  landmark: 'nav' | 'aside' | 'div';
  /** The sidebar's expanded width in rem, if it has one; the drawer is at least 20 rem wide. */
  width: number | undefined;
  /** No close button of the drawer's own: a SidebarTrigger inside closes it. */
  ownTrigger: boolean;
  closeOnNavigate: boolean;
  /**
   * Receives the index of the focused control among the drawer's controls as focus moves, so the
   * same control in the inline sidebar takes focus when the window widens past the breakpoint.
   */
  onFocusIndex: (index: number | undefined) => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * A sidebar below the frame's breakpoint: its content in a Drawer from its own side, named by its
 * label, which traps focus while open. Focus returns to the trigger after Escape, the close button
 * or the backdrop, and goes to AppShell.Main after a navigation.
 */
export function SidebarDrawer({
  store,
  side,
  id,
  label,
  landmark: Landmark,
  width,
  ownTrigger,
  closeOnNavigate,
  onFocusIndex,
  className,
  style,
  children,
}: SidebarDrawerProps) {
  const popup = useRef<HTMLDivElement>(null);
  const open = store.sides[side].openMobile;
  const size = width === undefined ? '20rem' : `max(${width}rem, 20rem)`;
  return (
    <Drawer
      ref={popup}
      open={open}
      onOpenChange={(next, details) =>
        store.setOpenMobile(side, next, reasons[details.reason] ?? 'trigger')
      }
      side={side}
      aria-label={label}
      closeButton={!ownTrigger}
      width={`min(${size}, 100vw - var(--env-space-8))`}
      finalFocus={() => {
        // After a navigation, focus goes to the page that opened; otherwise to the trigger.
        if (store.closeReasons.current[side] !== 'navigate') return true;
        const main = (popup.current?.ownerDocument ?? document).getElementById(store.mainId);
        if (!main) return true;
        // Main itself, not the first control inside it, which is where a focus target moves focus.
        requestAnimationFrame(() => main.focus({ preventScroll: true }));
        return false;
      }}
      id={id}
      className={classNames('env-sidebar', className)}
      style={style}
      data-mobile=""
      data-side={side}
      onFocus={(event) => {
        const index = Array.from(event.currentTarget.querySelectorAll(tabbable)).indexOf(
          event.target,
        );
        onFocusIndex(index === -1 ? undefined : index);
      }}
      onClick={(event) => {
        if (!closeOnNavigate) return;
        const link = (event.target as Element).closest?.('a[href]');
        if (link && event.currentTarget.contains(link))
          store.setOpenMobile(side, false, 'navigate');
      }}
    >
      <Landmark className="env-sidebar-panel" aria-label={Landmark === 'div' ? undefined : label}>
        {children}
      </Landmark>
    </Drawer>
  );
}
