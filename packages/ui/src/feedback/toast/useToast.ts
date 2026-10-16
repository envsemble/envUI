'use client';

import { createContext, useContext } from 'react';
import type { ToastManager } from './ToastTypes.js';

/** The manager of the nearest Toast.Provider. */
export const ToastManagerContext = createContext<ToastManager | null>(null);

/** Shows and dismisses notifications through the nearest Toast.Provider. */
export function useToast(): ToastManager {
  const manager = useContext(ToastManagerContext);
  if (!manager) throw new Error('useToast must be used inside Toast.Provider.');
  return manager;
}
