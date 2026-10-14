import { createContext } from 'react';

/**
 * open: side by side with the other open panels at the bottom of the region; minimized: a chip in
 * the strip along the bottom; maximized: filling the region.
 */
export type PanelDockMode = 'open' | 'minimized' | 'maximized';

/** What a panel's own window controls need: its mode and how to change it or close the panel. */
export interface PanelDockPanelContextValue {
  mode: PanelDockMode;
  /** The panel shows alone in a narrow dock, where it already fills the region. */
  stacked: boolean;
  changeMode: (mode: PanelDockMode) => void;
  close: () => void;
}

/** Set around each panel's content, so PanelDockHeader and PanelDockControls act on that panel. */
export const PanelDockPanelContext = createContext<PanelDockPanelContextValue | null>(null);
