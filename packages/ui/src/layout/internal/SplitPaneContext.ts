'use client';

import { createContext, useContext } from 'react';
import type { ContainerSize } from '../../foundations/useContainerSize.js';

/** The unit of a split pane's size: a percentage of the split pane, or rem. */
export type SizeUnit = '%' | 'rem';

/** What SplitPane.Root gives its handle and the layouts built on it, such as ListDetail. */
export interface SplitPaneContextValue {
  orientation: 'horizontal' | 'vertical';
  /** The first pane's size, in `unit`. */
  size: number;
  min: number;
  max: number;
  unit: SizeUnit;
  /** Whether the panes are stacked, below the root's stackBelow. */
  stacked: boolean;
  /** The root's content size, for converting rem sizes to a share of it. */
  rootSize: ContainerSize | undefined;
  change(size: number, committed: boolean): void;
  reset(): void;
}

export const SplitPaneContext = createContext<SplitPaneContextValue | null>(null);

/** The nearest split pane's state; null outside one. */
export function useSplitPane() {
  return useContext(SplitPaneContext);
}
