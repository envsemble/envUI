'use client';

import { createContext, useContext } from 'react';

/** Whether the shell sidebar shows icons only. AppShell provides it to its navigation. */
export const SidebarCompactContext = createContext(false);

/** True while the shell sidebar shows icons only; NavList.Item follows it automatically. */
export function useSidebarCompact() {
  return useContext(SidebarCompactContext);
}

/**
 * Whether content sits in a sidebar, expanded or showing icons only. The sidebar provides it, so
 * AccountMenu's automatic trigger is a row in an expanded sidebar and the avatar elsewhere.
 */
export const InSidebarContext = createContext(false);

/** True inside a sidebar. */
export function useInSidebar() {
  return useContext(InSidebarContext);
}
