'use client';

import { useCallback, useRef } from 'react';
import type { PanelDockPanel } from '../Root.js';
import type { PanelDockMode } from './PanelDockPanelContext.js';
import {
  fitsInRow,
  minimumWidth,
  newest,
  oldest,
  overflows,
  rowRoom,
  type Placement,
} from './dockLayout.js';

/** How long a dock with overflow="minimize" waits for an answer, in milliseconds. */
const answerTimeout = 5_000;

/** A change of mode a dock with overflow="minimize" asked for, until the application answers. */
interface FitRequest {
  id: string;
  mode: PanelDockMode;
  /** The panel's mode when asked; the panel in any other mode is the answer. */
  from: PanelDockMode;
  /** When the dock asked, from performance.now(). */
  since: number;
}

/** A panel a dock with overflow="minimize" minimized to make room. */
interface MinimizedForRoom {
  /** When the panel was last brought forward, its place among the others once it comes back. */
  time: number | undefined;
  /** The panel's minimum width in the row while open, borders and margins included, in pixels. */
  width: number;
  /** The inline size the row had for its panels then, in pixels. */
  room: number;
}

/** What fitting the row reads of the dock as it is now. */
interface RowState<T extends PanelDockPanel> {
  panels: readonly T[];
  /** The panels open side by side in the row, in order. */
  rowIds: readonly string[];
  placements: ReadonlyMap<string, Placement>;
  /** When each shown panel last appeared or was brought forward. */
  recency: Map<string, number>;
  /** Whether the dock stacks, or is about to. */
  stacks: () => boolean;
  frameOf: (id: string) => HTMLElement | undefined;
  /** The panel whose content holds focus. */
  focusedId: () => string | undefined;
}

/**
 * A dock's overflow="minimize": it minimizes panels the row has no room for and opens them again
 * once there is room, by asking the application, one change at a time.
 */
export function useDockOverflow<T extends PanelDockPanel>({
  overflow,
  changeMode,
  refresh,
}: {
  overflow: 'scroll' | 'minimize';
  changeMode: (id: string, mode: PanelDockMode) => void;
  /** Renders the dock again, so it looks once an answer is overdue. */
  refresh: () => void;
}) {
  // With overflow="minimize": the change the dock awaits the application's answer to, and a timer
  // that looks again once the answer is overdue; the panels the application kept open when asked
  // to minimize them, or opened again itself after the dock minimized them, each with the room the
  // row had then; and the panels the dock minimized to make room.
  const awaiting = useRef<FitRequest | null>(null);
  const answerTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const keptOpen = useRef(new Map<string, number>());
  const minimizedForRoom = useRef(new Map<string, MinimizedForRoom>());

  /**
   * With overflow="minimize", fits the open panels to the row. Where they cannot all sit side by
   * side at their minimum widths, the dock asks to minimize the least recently active one, never
   * the active panel, the newest or the one that holds focus, and only where that lets the rest fit. Once the region widens
   * past the room the row had when the dock minimized a panel, and the panel fits again at its
   * width while open, it asks to open it, the most recently active first. It asks for one change at
   * a time and waits for the answer; a panel the application keeps open, or opens again itself, is
   * not asked for again until the region changes size.
   */
  function fitRow(rowElement: HTMLElement, row: RowState<T>) {
    if (overflow !== 'minimize' || rowElement.getClientRects().length === 0) return;
    const room = rowRoom(rowElement);
    const { panels, rowIds, placements, recency, frameOf } = row;
    const asked = awaiting.current;
    if (asked) {
      const panel = panels.find(({ id }) => id === asked.id);
      if (panel?.mode === asked.from) {
        // The answer can come in a later render, as from a transition or after an asynchronous
        // step: until then the dock asks for nothing else. Once it is overdue, the application
        // keeps the panel as it is.
        if (performance.now() - asked.since < answerTimeout) return;
        minimizedForRoom.current.delete(asked.id);
        if (asked.mode === 'minimized') keptOpen.current.set(asked.id, room.size);
      } else if (asked.mode === 'open') minimizedForRoom.current.delete(asked.id);
      awaiting.current = null;
      clearTimeout(answerTimer.current);
    }
    for (const [id, size] of keptOpen.current)
      if (!rowIds.includes(id) || Math.abs(size - room.size) >= 1) keptOpen.current.delete(id);
    // A panel the dock minimized that closed is no longer the dock's to bring back, and one the
    // application opened again itself stays open until the region changes size.
    for (const id of minimizedForRoom.current.keys()) {
      const mode = panels.find((panel) => panel.id === id)?.mode;
      if (mode === 'minimized') continue;
      minimizedForRoom.current.delete(id);
      if (mode === 'open') keptOpen.current.set(id, room.size);
    }
    // A dock that stacks, or is about to as it first shows or narrows, also in the update that
    // narrows it, as the application's own state can, has no row to fit.
    if (row.stacks()) return;
    const inRow = panels.filter((panel) => placements.get(panel.id) === 'row');
    // Widths are read only where a decision needs them, as reading styles takes time.
    const widths = new Map<string, number>();
    const widthOf = (id: string) => {
      const width = widths.get(id) ?? minimumWidth(frameOf(id));
      widths.set(id, width);
      return width;
    };
    const fit = (list: readonly T[], more: readonly number[] = []) =>
      fitsInRow(room, [...list.map(({ id }) => widthOf(id)), ...more]);
    if (overflows(rowElement) && !fit(inRow)) {
      // The panel people work in stays, and so does the newest, such as one just brought back
      // from its tab, also alone in the row, the one that holds focus, as where people type, and
      // any the application kept open. Where those cannot fit by themselves, minimizing the others
      // would only hide them, and the row scrolls.
      const newestInRow = newest(inRow, recency);
      const focusedId = row.focusedId();
      const stays = (panel: T) =>
        panel.active ||
        panel === newestInRow ||
        panel.id === focusedId ||
        keptOpen.current.has(panel.id);
      if (!fit(inRow.filter(stays))) return;
      const others = inRow.filter((panel) => !stays(panel));
      const leaving = oldest(others, recency);
      if (!leaving) return;
      minimizedForRoom.current.set(leaving.id, {
        time: recency.get(leaving.id),
        width: widthOf(leaving.id),
        room: room.size,
      });
      ask(leaving, 'minimized');
      return;
    }
    // A panel comes back only as the region widens, and at the width it had while open, which a
    // style may make wider than while minimized: room that people free brings no panel back, and
    // minimizing and opening never alternate at one size.
    let returning: { panel: T; minimized: MinimizedForRoom } | undefined;
    for (const panel of panels) {
      const minimized = minimizedForRoom.current.get(panel.id);
      if (!minimized || panel.mode !== 'minimized' || room.size <= minimized.room + 1) continue;
      if (!returning || (minimized.time ?? 0) > (returning.minimized.time ?? 0))
        returning = { panel, minimized };
    }
    if (returning && fit(inRow, [returning.minimized.width])) ask(returning.panel, 'open');
  }

  /**
   * Asks the application to change a panel's mode. It answers by rendering the dock with the panel
   * in another mode, also in a later render; a panel still in its mode after answerTimeout is one
   * the application keeps as it is.
   */
  function ask(panel: T, mode: PanelDockMode) {
    const request = { id: panel.id, mode, from: panel.mode, since: performance.now() };
    awaiting.current = request;
    // Where the answer is overdue, the dock renders again to look; an answer renders it anyway.
    clearTimeout(answerTimer.current);
    answerTimer.current = setTimeout(() => {
      if (awaiting.current === request) refresh();
    }, answerTimeout + 50);
    changeMode(panel.id, mode);
  }

  /** The time a panel the dock is bringing back had among the others, where it is one. */
  const returningTime = useCallback((id: string) => {
    const request = awaiting.current;
    return request?.id === id && request.mode === 'open'
      ? minimizedForRoom.current.get(id)?.time
      : undefined;
  }, []);

  /** People brought the panel back: the dock leaves it to them from now on. */
  const release = useCallback((id: string) => {
    minimizedForRoom.current.delete(id);
  }, []);

  return { fitRow, returningTime, release };
}
