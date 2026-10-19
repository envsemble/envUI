'use client';

import { useContext } from 'react';
import { AppShellContext, type AppShellContextValue } from './FrameScroll.js';

export type { AppShellContextValue } from './FrameScroll.js';

/**
 * The frame's scrolling, for content inside AppShell.Root or WindowFrame.Root: the element that
 * scrolls and where sticky content sticks. Throws outside a frame.
 */
export function useAppShell(): AppShellContextValue {
  const value = useContext(AppShellContext);
  if (!value) throw new Error('useAppShell must be used inside AppShell.Root or WindowFrame.Root.');
  return value;
}
