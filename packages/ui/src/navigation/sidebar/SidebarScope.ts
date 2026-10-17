'use client';

import { createContext, useContext } from 'react';
import type { FrameStore } from '../app-shell/FrameStore.js';
import type { SidebarSide } from '../app-shell/persistence.js';

/** What a sidebar's own content knows of it: its side and settings, before the frame hears of them. */
export interface SidebarScope {
  side: SidebarSide;
  id: string;
  label: string;
  collapsible: 'offcanvas' | 'rail' | 'none';
  /** The content renders in the sidebar's drawer. */
  inDrawer: boolean;
  /**
   * A SidebarTrigger for this side inside the sidebar says so, so its drawer needs no close
   * button of its own; returns the function that takes it back.
   */
  registerTrigger?: () => () => void;
}

export const SidebarScopeContext = createContext<SidebarScope | null>(null);

/** The sidebar around the content, if any. */
export function useSidebarScope() {
  return useContext(SidebarScopeContext);
}

/** A sidebar's state and controls, as useSidebar returns them. */
export interface SidebarApi {
  side: SidebarSide;
  /** expanded while docked open, peeking, held or open in its drawer; collapsed otherwise. */
  state: 'expanded' | 'collapsed';
  /** The docked preference, which the frame remembers. */
  open: boolean;
  setOpen(open: boolean): void;
  toggle(): void;
  /** Below the frame's breakpoint, where the sidebar is a drawer. */
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile(open: boolean): void;
  /** Showing icons only right now: a collapsed rail, not peeking, not held and not in a drawer. */
  isRail: boolean;
  /** Shown expanded over the content, while hovered, focused or held. */
  peeking: boolean;
  /** At or above the sidebar's dockAt, where people can dock it expanded. */
  canDock: boolean;
  /** The chosen width in rem, if any. */
  width: number | undefined;
  setWidth(rem: number): void;
  /** Closes the drawer, a peek or a held rail; a docked sidebar stays. */
  dismiss(): void;
  collapsible: 'offcanvas' | 'rail' | 'none';
}

/** The API of one side of a frame store. */
export function sidebarApi(
  store: FrameStore,
  side: SidebarSide,
  scope?: SidebarScope | null,
): SidebarApi {
  const state = store.sides[side];
  const collapsible =
    (scope?.side === side ? scope.collapsible : undefined) ??
    state.registration?.collapsible ??
    'rail';
  const isMobile = store.isMobile;
  const docked = collapsible === 'none' || (state.open && state.canDock);
  const peeking = !isMobile && !docked && (state.peek || state.held);
  return {
    side,
    state: (isMobile ? state.openMobile : docked || peeking) ? 'expanded' : 'collapsed',
    open: state.open,
    setOpen: (open) => store.setOpen(side, open, 'api'),
    toggle: () => store.toggle(side, 'api'),
    isMobile,
    openMobile: state.openMobile,
    setOpenMobile: (open) => store.setOpenMobile(side, open, 'api'),
    isRail: !isMobile && !docked && !peeking && collapsible === 'rail',
    peeking,
    canDock: state.canDock,
    width: state.width,
    setWidth: (rem) => store.setWidth(side, rem, true),
    dismiss: () => store.dismiss(side, 'api'),
    collapsible,
  };
}
