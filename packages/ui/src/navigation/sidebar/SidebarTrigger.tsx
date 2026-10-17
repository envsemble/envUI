'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { IconButton, type IconButtonProps } from '../../actions/Button.js';
import { Kbd } from '../../content/Kbd.js';
import { Tooltip } from '../../feedback/Tooltip.js';
import { TooltipDescribesContext } from '../../feedback/internal/TooltipPopup.js';
import { appShell } from '../../foundations/messages/appShell.js';
import { DockToLeft } from '../../icons/DockToLeft.js';
import { DockToRight } from '../../icons/DockToRight.js';
import { Menu } from '../../icons/Menu.js';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { useDirection } from '../../internal/useDirection.js';
import { formatShortcut, useApplePlatform } from '../../internal/useShortcut.js';
import { useFrameStore } from '../app-shell/FrameStore.js';
import type { SidebarSide } from '../app-shell/persistence.js';
import { sidebarApi, useSidebarScope } from './SidebarScope.js';

export type SidebarTriggerProps = Omit<
  IconButtonProps,
  'icon' | 'aria-label' | 'variant' | 'tone'
> & {
  /**
   * Which sidebar the trigger opens and closes.
   * @default the sidebar around the trigger, else 'start'
   */
  side?: SidebarSide;
  /**
   * The application's mark, shown at rest; the toggle icon replaces it on hover and keyboard
   * focus, and always under a coarse pointer.
   */
  mark?: ReactNode;
  /**
   * The icon.
   * @default a docked-panel icon for the side, mirrored in right-to-left text; a menu icon below
   * the frame's breakpoint
   */
  icon?: ReactNode;
  /**
   * The name while the sidebar is collapsed.
   * @default 'Expand sidebar', or EnvUIProvider's messages.appShell.expandSidebar
   */
  expandLabel?: string;
  /**
   * The name while the sidebar is expanded, and in its drawer.
   * @default 'Collapse sidebar', or EnvUIProvider's messages.appShell.collapseSidebar
   */
  collapseLabel?: string;
  /**
   * The name while a collapsed sidebar shows over the content, where a press docks it.
   * @default 'Keep sidebar open', or EnvUIProvider's messages.appShell.keepSidebarOpen
   */
  keepOpenLabel?: string;
  /**
   * The name below the breakpoint, where a press opens the sidebar's drawer.
   * @default 'Open navigation' at the start and 'Open' with the sidebar's label at the end, or
   * EnvUIProvider's messages.appShell.openSidebar
   */
  openLabel?: string;
  /**
   * Show the name and the shortcut's keys in a tooltip.
   * @default true
   */
  tooltip?: boolean;
};

/**
 * The button that opens and closes a sidebar: it docks or collapses it where the window is wide
 * enough, holds a rail open over the content where it isn't, and opens the sidebar's drawer below
 * the frame's breakpoint. A ghost IconButton that reports the state it controls, the shortcut and
 * the sidebar it controls; hidden where there's nothing to toggle. onClick runs first, and
 * event.preventDefault() keeps the sidebar as it is. Needs AppShell.Root, Sidebar.Provider or the
 * Sidebar.Root around it.
 */
export function SidebarTrigger({
  side: ownSide,
  mark,
  icon,
  expandLabel,
  collapseLabel,
  keepOpenLabel,
  openLabel,
  tooltip = true,
  onClick,
  className,
  hidden,
  ...props
}: SidebarTriggerProps) {
  const store = useFrameStore();
  const scope = useSidebarScope();
  const messages = useMessages('appShell', appShell);
  const apple = useApplePlatform();
  const element = useRef<HTMLButtonElement>(null);
  const [direction] = useDirection(element);
  if (!store)
    throw new Error(
      'SidebarTrigger must be used inside AppShell.Root or Sidebar.Provider, or inside its Sidebar.Root.',
    );
  const side = ownSide ?? scope?.side ?? 'start';
  const own = scope?.side === side ? scope : null;
  const state = store.sides[side];
  const registration = state.registration;
  const api = sidebarApi(store, side, own);
  const label = own?.label ?? registration?.label ?? '';
  // Before the sidebar registers, as on the server, the id its side gives it.
  const id = own?.id ?? registration?.id ?? store.sideIds[side];
  const mobile = api.isMobile;
  // A trigger in the sidebar's own drawer closes it.
  const inDrawer = own?.inDrawer ?? false;
  useLayoutEffect(() => own?.registerTrigger?.(), [own]);

  const docked = api.collapsible === 'none' || (state.open && state.canDock);
  const shown = api.peeking;
  const name = mobile
    ? inDrawer || state.openMobile
      ? (collapseLabel ?? messages.collapseSidebar)
      : (openLabel ?? messages.openSidebar({ label, side }))
    : state.canDock
      ? state.open
        ? (collapseLabel ?? messages.collapseSidebar)
        : shown
          ? (keepOpenLabel ?? messages.keepSidebarOpen)
          : (expandLabel ?? messages.expandSidebar)
      : shown
        ? (collapseLabel ?? messages.collapseSidebar)
        : (expandLabel ?? messages.expandSidebar);
  const expanded = mobile ? state.openMobile : docked || state.held;
  // Nothing to toggle: a sidebar that never collapses above the breakpoint, or none below it.
  const nothing = mobile
    ? registration?.mobile === 'none'
    : (own?.collapsible ?? registration?.collapsible) === 'none';
  const shortcut = store.shortcuts[side];
  const display = shortcut ? formatShortcut(shortcut, apple) : undefined;
  const towardEnd = (side === 'start') === (direction === 'ltr');
  const glyph =
    icon ?? (mobile && !inDrawer ? <Menu /> : towardEnd ? <DockToRight /> : <DockToLeft />);

  const button = (
    <IconButton
      {...props}
      ref={element}
      variant="ghost"
      hidden={hidden ?? nothing}
      aria-label={name}
      aria-expanded={expanded}
      aria-controls={id}
      aria-keyshortcuts={display?.ariaKeyShortcuts}
      data-sidebar-trigger=""
      data-state={expanded ? 'expanded' : 'collapsed'}
      data-side={side}
      data-mark={mark != null ? '' : undefined}
      className={classNames('env-sidebar-trigger', className)}
      icon={
        mark != null ? (
          <span className="env-sidebar-trigger-glyphs">
            <span className="env-sidebar-trigger-mark">{mark}</span>
            <span className="env-sidebar-trigger-icon">{glyph}</span>
          </span>
        ) : (
          glyph
        )
      }
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        store.toggle(side, 'trigger');
      }}
    />
  );
  // In its drawer the trigger takes focus as the drawer opens: a tooltip there would take the first
  // Escape, which should close the drawer.
  if (!tooltip || inDrawer) return button;
  return (
    // The tooltip shows the name and keys that aria-label and aria-keyshortcuts announce.
    <TooltipDescribesContext value={false}>
      <Tooltip
        side="bottom"
        content={
          display ? (
            <span className="env-sidebar-trigger-tooltip">
              {name} <Kbd keys={display.keys} />
            </span>
          ) : (
            name
          )
        }
      >
        {button}
      </Tooltip>
    </TooltipDescribesContext>
  );
}
