'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import type { PanelDockPanel } from '../Root.js';

/**
 * When each shown panel last appeared or was brought forward, on a clock of its own; a stacked dock
 * shows the newest. Shown panels keep the time they appeared; minimized and closed ones are
 * forgotten, so a panel brought back is the newest again.
 */
export function useRecency(
  panels: readonly PanelDockPanel[],
  /** The time a panel the dock is bringing back had among the others, where it is one. */
  returningTime: (id: string) => number | undefined,
) {
  const times = useRef(new Map<string, number>());
  const clock = useRef(0);
  const bringForward = useCallback((id: string) => {
    times.current.set(id, ++clock.current);
  }, []);
  const now = useCallback(() => clock.current, []);

  useLayoutEffect(() => {
    const shownIds = new Set<string>();
    for (const panel of panels) {
      if (panel.mode === 'minimized') continue;
      shownIds.add(panel.id);
      if (times.current.has(panel.id)) continue;
      // A panel the dock brings back once it fits again returns to its place among the others.
      const earlier = returningTime(panel.id);
      if (earlier === undefined) bringForward(panel.id);
      else times.current.set(panel.id, earlier);
    }
    for (const id of times.current.keys()) if (!shownIds.has(id)) times.current.delete(id);
  }, [panels, returningTime, bringForward]);

  return { times: times.current, now, bringForward };
}
