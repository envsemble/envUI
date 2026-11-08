'use client';

import { useLayoutEffect, useRef } from 'react';
import type { PanelDockPanel } from '../Root.js';
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
  /** Whether the dock has yet to read its layout. */
  pending: boolean;
  recency: ReturnType<typeof useRecency>;
}) {
  // The panel a tab asked a stacked dock to show, also where the application does not activate
  // panels, until the situation it was asked in changes.
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
  // Until the dock reads its layout, its markup carries both: the side-by-side one, which the
  // dock's behaviour follows meanwhile, and the stacked one, which its container query shows where
  // the dock is narrow, so the server's markup and the first paint already stack.
  const stackedLayout = pending ? arrange(true) : undefined;
  const tabs = panels.filter((panel) => placements.get(panel.id) === 'hidden');
  const stackedTabs = stackedLayout
    ? panels.filter((panel) => stackedLayout.placements.get(panel.id) === 'hidden')
    : tabs;
  const shownTabs = stackedLayout
    ? panels.filter((panel) => tabs.includes(panel) || stackedTabs.includes(panel))
    : tabs;

  // A tab's choice that no longer holds is forgotten, so it never returns with an earlier state,
  // such as the panel that was active when it was made; one a newer panel took over now is that
  // panel's.
  useLayoutEffect(() => {
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
    /** Where each panel shows in the stacked layout, while the layout is unread. */
    stackedPlacements: stackedLayout?.placements,
    /** Whether the stacked layout fills the region, while the layout is unread. */
    stackedFilled: stackedLayout?.filling !== undefined,
    /** The panels behind their tabs. */
    tabs,
    /** The panels behind their tabs in the stacked layout, while the layout is unread. */
    stackedTabs,
    /** The tabs the strip holds: those of either layout while it is unread. */
    shownTabs,
    rowIds: panels.filter((panel) => placements.get(panel.id) === 'row').map(({ id }) => id),
    /** Where every panel shows, as a key that changes with any of them. */
    layout: panels.map(({ id }) => `${id}:${placements.get(id)}`).join('\n'),
    /** While the layout is unread, the one layout that has a tab or the strip, if only one does. */
    tabIn: (wide: boolean, inStacked: boolean) =>
      !stackedLayout || wide === inStacked ? undefined : wide ? 'wide' : 'stacked',
    /** A tab asked a stacked dock to show its panel, brought forward just now. */
    chooseTab: (id: string) => {
      tabChoice.current = { id, active: activeId, time: recency.now() };
    },
  };
}
