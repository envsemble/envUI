'use client';

import { createContext } from 'react';
import type { PanelDockMode } from '../panelDockTypes.js';

/** What a panel's own window controls need: its mode and how to change it or close the panel. */
export interface PanelDockPanelContextValue {
  mode: PanelDockMode;
  /** The panel shows alone in a narrow dock, where it already fills the region. */
  stacked: boolean;
  changeMode: (mode: PanelDockMode) => void;
  close: () => void;
  /** Receives the block size of the panel's sticky header in pixels, or 0 once it goes. */
  reportHeaderSize: (size: number) => void;
  /** The panel's content has scrolled from its top, beneath the sticky header. */
  scrolled: boolean;
}

/** Set around each panel's content, so PanelDock.Header and its window controls act on that panel. */
export const PanelDockPanelContext = createContext<PanelDockPanelContextValue | null>(null);
