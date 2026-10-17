'use client';

import { createContext, useContext } from 'react';

/**
 * Whether the sidebar around the content shows icons only: a collapsed rail that isn't shown
 * expanded over the content. Sidebar.Root provides it; NavList, SearchTrigger and AccountMenu read
 * it, so their items show only their icons in a rail without remounting.
 */
export const SidebarRailContext = createContext(false);

/** True while the sidebar around the content shows icons only; NavList.Item follows it. */
export function useSidebarRail() {
  return useContext(SidebarRailContext);
}

/**
 * Whether content sits in a sidebar, expanded, showing icons only or in its drawer. Sidebar.Root
 * provides it, so AccountMenu's automatic trigger is a row in an expanded sidebar and the avatar
 * elsewhere.
 */
export const InSidebarContext = createContext(false);

/** True inside a sidebar. */
export function useInSidebar() {
  return useContext(InSidebarContext);
}
