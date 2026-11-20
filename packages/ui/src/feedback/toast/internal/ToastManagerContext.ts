'use client';

import { createContext } from 'react';
import type { ToastManager } from '../toastTypes.js';

/** The manager of the nearest ToastProvider. */
export const ToastManagerContext = createContext<ToastManager | null>(null);
