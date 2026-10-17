'use client';

import { useMemo } from 'react';
import { useFrameStore } from '../app-shell/FrameStore.js';
import type { SidebarSide } from '../app-shell/persistence.js';
import { sidebarApi, useSidebarScope, type SidebarApi } from './SidebarScope.js';

export type { SidebarApi } from './SidebarScope.js';

/**
 * A sidebar's state and controls, for content that adapts to it, such as avatars only in a rail
 * (isRail), or that closes it after a choice (dismiss). side defaults to the sidebar around the
 * caller, else start. Throws outside AppShell.Root and Sidebar.Provider; a Sidebar.Root without
 * one provides its own to its content.
 */
export function useSidebar(side?: SidebarSide): SidebarApi {
  const store = useFrameStore();
  const scope = useSidebarScope();
  if (!store)
    throw new Error(
      'useSidebar must be used inside AppShell.Root or Sidebar.Provider, or inside a Sidebar.Root.',
    );
  const which = side ?? scope?.side ?? 'start';
  // The API is rebuilt only as the store changes.
  return useMemo(() => sidebarApi(store, which, scope), [store, which, scope]);
}
