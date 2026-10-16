import { createContext, useContext } from 'react';

/** Whether the shell sidebar shows icons only. AppShell provides it to its navigation. */
export const SidebarCompactContext = createContext(false);

/** True while the shell sidebar shows icons only; NavList.Item follows it automatically. */
export function useSidebarCompact() {
  return useContext(SidebarCompactContext);
}
