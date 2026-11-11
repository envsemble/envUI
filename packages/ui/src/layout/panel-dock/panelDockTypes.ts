import type { ReactNode } from 'react';

/**
 * open: side by side with the other open panels at the bottom of the region; minimized: a chip in
 * the strip along the bottom; maximized: filling the region.
 */
export type PanelDockMode = 'open' | 'minimized' | 'maximized';

export interface PanelDockPanel {
  /** Stable, unique identifier; the panel and its tab carry it as data-panel-id. */
  id: string;
  /** The panel's name: the accessible name of its region, and the text of its tab. */
  title: string;
  /**
   * open: side by side with the other open panels at the bottom inline-end; minimized: a tab in
   * the strip that floats over the bottom edge; maximized: filling the region.
   */
  mode: PanelDockMode;
  /**
   * Height of the open panel in rem, as Sheet's and Panes' sizes are. Without it, the panel starts
   * at 85% of the room in the dock, up to 40 rem, and keeps the height people choose.
   */
  height?: number;
  /**
   * Width of the open panel where the row has room, in rem.
   * @default 32
   */
  preferredWidth?: number;
  /**
   * The narrowest the open panel gets when the row runs short, in rem.
   * @default 20
   */
  minWidth?: number;
  /**
   * The widest the open panel gets, in rem.
   * @default 48
   */
  maxWidth?: number;
  /**
   * The lowest height people can resize the panel to, in rem.
   * @default 15
   */
  minHeight?: number;
  /** The greatest height people can resize the panel to, in rem; the room in the dock by default. */
  maxHeight?: number;
  /** The panel people work in: in front of the other open panels, and shown by a stacked dock. */
  active?: boolean;
  /** Text of the tab, where a shorter one helps; the title by default. */
  label?: string;
  /** A leading icon on the tab. */
  icon?: ReactNode;
  /** Shows a dot on the tab and describes it with this text, such as Unsaved changes. */
  attention?: string;
  /** Tooltip content of the tab, such as the full title with a detail. */
  tooltip?: ReactNode;
}
