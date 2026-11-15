'use client';

import { useLayoutEffect, useState } from 'react';
import { roundToHundredth } from '../../../internal/dom/lengths.js';
import type { PanelDockPanel } from '../panelDockTypes.js';
import { clampRound, type HeightBounds } from './dockLayout.js';
import type { DockMeasurements } from './useDockMeasurements.js';

const defaultHeightShareOfRoom = 0.85;
const defaultHeightRem = 40;
const minHeightRem = 15;
const browserDefaultRemPx = 16;

/**
 * The heights of open panels. A panel's sizes are in rem, and the dock works in pixels; a panel
 * without a height of its own keeps the height people choose.
 */
export function usePanelHeights(
  panels: readonly PanelDockPanel[],
  measurements: DockMeasurements | undefined,
  onHeightChange: (id: string, heightRem: number) => void,
) {
  const [chosenHeights, setChosenHeights] = useState<ReadonlyMap<string, number>>(() => new Map());
  const rem = measurements?.rem ?? browserDefaultRemPx;

  useLayoutEffect(
    function forgetHeightsOfClosedPanels() {
      const ids = new Set(panels.map(({ id }) => id));
      if ([...chosenHeights.keys()].some((id) => !ids.has(id)))
        setChosenHeights(
          (current) =>
            new Map([...current].filter(([id]) => ids.has(id))) as ReadonlyMap<string, number>,
        );
    },
    [panels, chosenHeights],
  );

  function heightOf(panel: PanelDockPanel): { height?: number; bounds?: HeightBounds } {
    const requested = panel.height === undefined ? chosenHeights.get(panel.id) : panel.height * rem;
    if (!measurements) return { height: requested };
    const { room } = measurements;
    const max = Math.floor(Math.max(0, Math.min((panel.maxHeight ?? Infinity) * rem, room)));
    const min = Math.round(Math.min((panel.minHeight ?? minHeightRem) * rem, max));
    const fallback = Math.min(room * defaultHeightShareOfRoom, defaultHeightRem * rem);
    return { height: clampRound(requested ?? fallback, min, max), bounds: { min, max, room } };
  }

  function resize(panel: PanelDockPanel, height: number) {
    if (panel.height === undefined)
      setChosenHeights((current) =>
        current.get(panel.id) === height ? current : new Map(current).set(panel.id, height),
      );
    onHeightChange(panel.id, roundToHundredth(height / rem));
  }

  return { heightOf, resize };
}
