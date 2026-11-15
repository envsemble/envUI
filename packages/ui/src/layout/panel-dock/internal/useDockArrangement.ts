'use client';

import { useLayoutEffect, useRef } from 'react';
import type { PanelDockPanel } from '../panelDockTypes.js';
import {
  fillCandidates,
  heldChoice,
  newest,
  type Placement,
  type TabChoice,
} from './dockLayout.js';
import type { useRecency } from './useRecency.js';

/**
 * Where each panel shows. A stacked dock fills the region with one shown panel: the one its tab
 * asked for, else the active one, else the newest; a wide one with its maximized panel. The others
 * wait behind their tabs.
 */
export function useDockArrangement<Panel extends PanelDockPanel>({
  panels,
  stacked,
  pending,
  recency,
}: {
  panels: readonly Panel[];
  stacked: boolean;
  pending: boolean;
  recency: ReturnType<typeof useRecency>;
}) {
  const tabChoice = useRef<TabChoice | null>(null);
  const activeId = panels.find((panel) => panel.active)?.id;
  const arrange = (asStacked: boolean) => {
    const shown = fillCandidates(panels, asStacked);
    const chosen = asStacked
      ? heldChoice(tabChoice.current, panels, activeId, recency.times)
      : undefined;
    const filling =
      shown.find((panel) => panel.id === chosen) ??
      shown.find((panel) => panel.active) ??
      newest(shown, recency.times);
    const placements = new Map<string, Placement>();
    for (const panel of panels)
      placements.set(
        panel.id,
        panel === filling ? 'fill' : !asStacked && panel.mode === 'open' ? 'row' : 'hidden',
      );
    return { chosen, filling, placements };
  };
  const { chosen, filling, placements } = arrange(stacked);
  const stackedLayoutUntilRead = pending ? arrange(true) : undefined;
  const tabs = panels.filter((panel) => placements.get(panel.id) === 'hidden');
  const stackedTabs = stackedLayoutUntilRead
    ? panels.filter((panel) => stackedLayoutUntilRead.placements.get(panel.id) === 'hidden')
    : tabs;
  const shownTabs = stackedLayoutUntilRead
    ? panels.filter((panel) => tabs.includes(panel) || stackedTabs.includes(panel))
    : tabs;

  useLayoutEffect(function forgetTabChoiceThatNoLongerHolds() {
    const choice = tabChoice.current;
    if (!choice || chosen === choice.id) return;
    tabChoice.current =
      chosen === undefined
        ? null
        : { id: chosen, active: activeId, time: recency.times.get(chosen) ?? recency.now() };
  });

  return {
    filling,
    placements,
    stackedPlacements: stackedLayoutUntilRead?.placements,
    stackedFilled: stackedLayoutUntilRead?.filling !== undefined,
    tabs,
    stackedTabs,
    shownTabs,
    rowIds: panels.filter((panel) => placements.get(panel.id) === 'row').map(({ id }) => id),
    layoutKey: panels.map(({ id }) => `${id}:${placements.get(id)}`).join('\n'),
    tabIn: (wide: boolean, inStacked: boolean) =>
      !stackedLayoutUntilRead || wide === inStacked ? undefined : wide ? 'wide' : 'stacked',
    chooseTab: (id: string) => {
      tabChoice.current = { id, active: activeId, time: recency.now() };
    },
  };
}
