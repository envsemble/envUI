'use client';

import { useCallback, useRef } from 'react';
import type { PanelDockMode, PanelDockPanel } from '../panelDockTypes.js';
import {
  fitsInRow,
  minimumWidth,
  newest,
  oldest,
  overflows,
  rowRoom,
  type Placement,
} from './dockLayout.js';

const answerTimeoutMs = 5_000;
const lookAgainOnceOverdueMs = answerTimeoutMs + 50;

interface ModeChangeRequest {
  id: string;
  mode: PanelDockMode;
  modeWhenAsked: PanelDockMode;
  askedAt: number;
}

interface MinimizedForRoom {
  recencyWhenMinimized: number | undefined;
  minimumWidthWhileOpen: number;
  rowRoomWhenMinimized: number;
}

interface RowState<T extends PanelDockPanel> {
  panels: readonly T[];
  rowIds: readonly string[];
  placements: ReadonlyMap<string, Placement>;
  recency: Map<string, number>;
  stacks: () => boolean;
  frameOf: (id: string) => HTMLElement | undefined;
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
  refresh: () => void;
}) {
  const awaitingAnswer = useRef<ModeChangeRequest | null>(null);
  const overdueTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const keptOpenAtRowRoom = useRef(new Map<string, number>());
  const minimizedForRoom = useRef(new Map<string, MinimizedForRoom>());

  function fitRow(rowElement: HTMLElement, row: RowState<T>) {
    if (overflow !== 'minimize' || rowElement.getClientRects().length === 0) return;
    const room = rowRoom(rowElement);
    const { panels, rowIds, placements, recency, frameOf } = row;
    const asked = awaitingAnswer.current;
    if (asked) {
      const panel = panels.find(({ id }) => id === asked.id);
      const unanswered = panel?.mode === asked.modeWhenAsked;
      if (unanswered) {
        const answerOverdue = performance.now() - asked.askedAt >= answerTimeoutMs;
        if (!answerOverdue) return;
        minimizedForRoom.current.delete(asked.id);
        const applicationKeptPanelOpen = asked.mode === 'minimized';
        if (applicationKeptPanelOpen) keptOpenAtRowRoom.current.set(asked.id, room.size);
      } else if (asked.mode === 'open') minimizedForRoom.current.delete(asked.id);
      awaitingAnswer.current = null;
      clearTimeout(overdueTimer.current);
    }
    for (const [id, size] of keptOpenAtRowRoom.current) {
      const regionChangedSize = Math.abs(size - room.size) >= 1;
      if (!rowIds.includes(id) || regionChangedSize) keptOpenAtRowRoom.current.delete(id);
    }
    for (const id of minimizedForRoom.current.keys()) {
      const mode = panels.find((panel) => panel.id === id)?.mode;
      if (mode === 'minimized') continue;
      minimizedForRoom.current.delete(id);
      const reopenedByApplication = mode === 'open';
      if (reopenedByApplication) keptOpenAtRowRoom.current.set(id, room.size);
    }
    if (row.stacks()) return;
    const inRow = panels.filter((panel) => placements.get(panel.id) === 'row');
    const measuredWidths = new Map<string, number>();
    const widthOf = (id: string) => {
      const width = measuredWidths.get(id) ?? minimumWidth(frameOf(id));
      measuredWidths.set(id, width);
      return width;
    };
    const fit = (list: readonly T[], more: readonly number[] = []) =>
      fitsInRow(room, [...list.map(({ id }) => widthOf(id)), ...more]);
    if (overflows(rowElement) && !fit(inRow)) {
      const newestInRow = newest(inRow, recency);
      const focusedId = row.focusedId();
      const neverMinimizedForRoom = (panel: T) =>
        panel.active ||
        panel === newestInRow ||
        panel.id === focusedId ||
        keptOpenAtRowRoom.current.has(panel.id);
      const minimizingOthersWouldOnlyHideThem = !fit(inRow.filter(neverMinimizedForRoom));
      if (minimizingOthersWouldOnlyHideThem) return;
      const others = inRow.filter((panel) => !neverMinimizedForRoom(panel));
      const leaving = oldest(others, recency);
      if (!leaving) return;
      minimizedForRoom.current.set(leaving.id, {
        recencyWhenMinimized: recency.get(leaving.id),
        minimumWidthWhileOpen: widthOf(leaving.id),
        rowRoomWhenMinimized: room.size,
      });
      ask(leaving, 'minimized');
      return;
    }
    let mostRecentReturning: { panel: T; minimized: MinimizedForRoom } | undefined;
    for (const panel of panels) {
      const minimized = minimizedForRoom.current.get(panel.id);
      if (!minimized || panel.mode !== 'minimized') continue;
      const regionWidenedSinceMinimized = room.size > minimized.rowRoomWhenMinimized + 1;
      if (!regionWidenedSinceMinimized) continue;
      const moreRecent =
        (minimized.recencyWhenMinimized ?? 0) >
        (mostRecentReturning?.minimized.recencyWhenMinimized ?? 0);
      if (!mostRecentReturning || moreRecent) mostRecentReturning = { panel, minimized };
    }
    if (mostRecentReturning && fit(inRow, [mostRecentReturning.minimized.minimumWidthWhileOpen]))
      ask(mostRecentReturning.panel, 'open');
  }

  function ask(panel: T, mode: PanelDockMode) {
    const request = { id: panel.id, mode, modeWhenAsked: panel.mode, askedAt: performance.now() };
    awaitingAnswer.current = request;
    clearTimeout(overdueTimer.current);
    overdueTimer.current = setTimeout(() => {
      if (awaitingAnswer.current === request) refresh();
    }, lookAgainOnceOverdueMs);
    changeMode(panel.id, mode);
  }

  const returningTime = useCallback((id: string) => {
    const request = awaitingAnswer.current;
    return request?.id === id && request.mode === 'open'
      ? minimizedForRoom.current.get(id)?.recencyWhenMinimized
      : undefined;
  }, []);

  const leaveToPeople = useCallback((id: string) => {
    minimizedForRoom.current.delete(id);
  }, []);

  return { fitRow, returningTime, leaveToPeople };
}
