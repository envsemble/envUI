'use client';

import { createContext, useContext } from 'react';
import type { ToastManager } from './toastTypes.js';

/** The manager of the nearest ToastProvider. */
export const ToastManagerContext = createContext<ToastManager | null>(null);

/**
 * Shows and dismisses notifications through the nearest ToastProvider: show, dismiss and clear.
 * Throws outside a provider.
 */
export function useToast(): ToastManager {
  const manager = useContext(ToastManagerContext);
  if (!manager) throw new Error('useToast must be used inside ToastProvider.');
  return manager;
}
