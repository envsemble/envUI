'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { classNames } from '../../internal/classNames.js';
import { cssLength } from '../../internal/cssLength.js';
import { setRef } from '../../internal/setRef.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { useStackedReport } from '../../internal/useStackedReport.js';
import { panelDock as panelDockMessages } from '../../foundations/messages/panelDock.js';
import type { PanelDockMode } from '../internal/PanelDockContext.js';
import {
  clampRound,
  fitsInRow,
  heldChoice,
  isAtRowEnd,
  isShown,
  locateFocus,
  minimumWidth,
  newest,
  oldest,
  overflows,
  readScrollPositions,
  reveal,
  revealInContent,
  revealInWindow,
  rowRoom,
  scrollToRowEnd,
  type FocusedPanel,
  type HeightBounds,
  type Placement,
  type ScrollPosition,
  type TabChoice,
} from './dockLayout.js';
import { PanelFrame } from './PanelFrame.js';
import { PanelTab } from './PanelTab.js';

export type { PanelDockMode };

export interface PanelDockPanel {
  /** Stable, unique identifier; the panel and its tab carry it as data-panel-id. */
  id: string;
  /** The panel's name: the accessible name of its region, and the text of its tab. */
  title: string;
  /**
   * open: side by side with the other open panels at the bottom inline-end; minimized: a tab in
   * the strip along the bottom; maximized: filling the region.
   */
  mode: PanelDockMode;
  /**
   * Height of the open panel in pixels. Without it, the panel starts at 85% of the room above the
   * tabs, up to 40 rem, and keeps the height people choose.
   */
  height?: number;
  /** Width of the open panel where the row has room, in pixels; 32 rem by default. */
  preferredWidth?: number;
  /** The narrowest the open panel gets when the row runs short, in pixels; 20 rem by default. */
  minWidth?: number;
  /** The widest the open panel gets, in pixels; 48 rem by default. */
  maxWidth?: number;
  /** The lowest height people can resize the panel to, in pixels; 15 rem by default. */
  minHeight?: number;
  /** The greatest height people can resize the panel to, in pixels; the room above the tabs. */
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

export interface RootProps<T extends PanelDockPanel = PanelDockPanel>
  extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * The panels in order, each a PanelDockPanel: open panels sit side by side, the newest at the
   * end, and tabs follow in the same order. The application owns them.
   */
  panels: readonly T[];
  /**
   * Renders a panel's content from its panel, such as a PanelDock.Header above the panel's body.
   * The content mounts once and stays mounted until the panel closes.
   */
  children: (panel: T) => ReactNode;
  /**
   * Called with the mode a panel asks for, from its window controls and its tab, and from the dock
   * itself with overflow="minimize".
   */
  onModeChange: (id: string, mode: PanelDockMode) => void;
  /** Called from a panel's close control and its tab's close button. */
  onClose: (id: string) => void;
  /**
   * Called when people press or focus inside a panel that is not active, and when its tab brings
   * it back.
   */
  onActivate?: (id: string) => void;
  /**
   * Called with a panel's new height in pixels when a drag on its top edge ends, and on each key
   * press there.
   */
  onHeightChange?: (id: string, height: number) => void;
  /**
   * A width, 40rem by default, or a number of pixels, such as 600 or "600": while the dock itself
   * is narrower, one panel at a time fills it and the others wait as tabs. The dock then has
   * data-stacked.
   */
  stackBelow?: string | number;
  /** Called with true when the dock stacks and with false when its panels sit side by side. */
  onStackedChange?: (stacked: boolean) => void;
  /**
   * What the dock does when its open panels cannot all sit side by side at their minimum widths:
   * scroll (default) scrolls the row sideways; minimize asks onModeChange to minimize the least
   * recently active open panel, one at a time, until the rest fit, and to open it again once the
   * region widens and it fits. It never asks for the active panel, the newest one or the one that
   * holds focus, so never for a panel alone in the row, and where those cannot fit by themselves the
   * row scrolls instead.
   */
  overflow?: 'scroll' | 'minimize';
  /**
   * Accessible name of the list of tabs, which holds minimized panels and the panels a stacked dock
   * leaves out, for this dock only.
   * @default 'Hidden panels', or EnvUIProvider's messages.panelDock.hidden
   */
  minimizedLabel?: string;
  /**
   * Accessible name of a tab's button that shows its panel, from the tab's text, for this dock
   * only. A function, as each tab names its own panel.
   * @default Show and the text, such as Show Budget, or EnvUIProvider's messages.panelDock.show
   */
  showLabel?: (label: string) => string;
  /**
   * Accessible name of a tab's close button, from the tab's text, for this dock only.
   * @default Close and the text, such as Close Budget, or EnvUIProvider's messages.panelDock.closePanel
   */
  closeLabel?: (label: string) => string;
  /**
   * Accessible name of a panel's resize handle, from its title, for this dock only.
   * @default Resize and the title, such as Resize Quarterly report, or EnvUIProvider's messages.panelDock.resize
   */
  resizeLabel?: (title: string) => string;
}

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

interface Measurements {
  /** Pixels per rem. */
  rem: number;
  /** The block size open panels have above the tabs, in pixels. */
  room: number;
}

/** A panel without a height takes this share of the room, up to defaultHeightRem. */
const defaultHeightShare = 0.85;
const defaultHeightRem = 40;
const minHeightRem = 15;
/** How long a dock with overflow="minimize" waits for an answer, in milliseconds. */
const answerTimeout = 5_000;

/**
 * Panels docked to the bottom inline-end edge of a region, beside the page, for items people work
 * on alongside it, such as drafts and conversations: open panels side by side, one maximized panel
 * filling the region, and minimized panels as tabs. A panel's content stays mounted through every
 * change of mode and order.
 */
export function Root<T extends PanelDockPanel>({
  panels,
  children,
  onModeChange,
  onClose,
  onActivate,
  onHeightChange,
  stackBelow = '40rem',
  onStackedChange,
  overflow = 'scroll',
  minimizedLabel,
  showLabel,
  closeLabel,
  resizeLabel,
  className,
  ref,
  ...props
}: RootProps<T>) {
  // Words that fit a minimized panel and one a stacked dock leaves out alike.
  const messages = useMessages('panelDock', panelDockMessages);
  const tabsLabel = minimizedLabel ?? messages.hidden;
  const nameShow = showLabel ?? ((label: string) => messages.show({ label }));
  const nameClose = closeLabel ?? ((label: string) => messages.closePanel({ label }));
  const nameResize = resizeLabel ?? ((label: string) => messages.resize({ label }));
  const root = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  // The element in each panel's content that last had focus, where restoring the panel returns.
  const lastFocused = useRef(new Map<string, HTMLElement>());
  // The panel whose content holds focus, also in a popup it opened, such as a menu in a portal:
  // React's focus events reach the panel through portals. It holds the element that took focus, as
  // an element that leaves while it has focus fires no blur, and focus elsewhere is no longer the
  // panel's.
  const focusedPanel = useRef<FocusedPanel | null>(null);
  // When each shown panel last appeared or was brought forward; a stacked dock shows the newest.
  const recency = useRef(new Map<string, number>());
  const clock = useRef(0);
  // A panel its tab asked to bring back, which takes focus once it shows.
  const pendingRestore = useRef<string | null>(null);
  // The panel a tab asked a stacked dock to show, also where the application does not activate
  // panels, until the situation it was asked in changes.
  const tabChoice = useRef<TabChoice | null>(null);
  // With overflow="minimize": the change the dock awaits the application's answer to, and a timer
  // that looks again once the answer is overdue; the panels the application kept open when asked
  // to minimize them, or opened again itself after the dock minimized them, each with the room the
  // row had then; and the panels the dock minimized to make room.
  const awaiting = useRef<FitRequest | null>(null);
  const answerTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const keptOpen = useRef(new Map<string, number>());
  const minimizedForRoom = useRef(new Map<string, MinimizedForRoom>());
  const atRowEnd = useRef(true);
  const previousRow = useRef<readonly string[]>([]);
  const previousTabs = useRef<readonly string[]>([]);
  const [stacked, setStacked] = useChangingState(false);
  const [measurements, setMeasurements] = useState<Measurements>();
  const [overflowing, setOverflowing] = useChangingState(false);
  // Heights people chose for panels without a height of their own.
  const [chosenHeights, setChosenHeights] = useState<ReadonlyMap<string, number>>(() => new Map());
  const [, refresh] = useReducer((count: number) => count + 1, 0);
  const latest = useRef({ onModeChange, onClose, onActivate, onHeightChange });
  useLayoutEffect(() => {
    latest.current = { onModeChange, onClose, onActivate, onHeightChange };
  });
  const changeMode = useCallback(
    (id: string, mode: PanelDockMode) => latest.current.onModeChange(id, mode),
    [],
  );
  const close = useCallback((id: string) => latest.current.onClose(id), []);

  // A stacked dock fills the region with one shown panel: the one its tab asked for, else the
  // active one, else the newest; a wide one with its maximized panel. The others wait behind their
  // tabs.
  const maximized = panels.filter((panel) => panel.mode === 'maximized');
  const shown = stacked ? panels.filter((panel) => panel.mode !== 'minimized') : maximized;
  const activeId = panels.find((panel) => panel.active)?.id;
  const chosen = stacked
    ? heldChoice(tabChoice.current, panels, activeId, recency.current)
    : undefined;
  const filling =
    shown.find((panel) => panel.id === chosen) ??
    shown.find((panel) => panel.active) ??
    newest(shown, recency.current);
  const placements = new Map<string, Placement>();
  for (const panel of panels)
    placements.set(
      panel.id,
      panel === filling ? 'fill' : !stacked && panel.mode === 'open' ? 'row' : 'hidden',
    );
  const tabs = panels.filter((panel) => placements.get(panel.id) === 'hidden');
  const rowIds = panels.filter((panel) => placements.get(panel.id) === 'row').map(({ id }) => id);
  const layout = panels.map(({ id }) => `${id}:${placements.get(id)}`).join('\n');
  const hasTabs = tabs.length > 0;
  const filled = filling !== undefined;
  // Where focus is before this update is committed, read while a panel or tab that is about to
  // hide or leave still holds it.
  const focusBefore = locateFocus(root.current, focusedPanel.current);
  // Scroll positions inside the panels before an update that moves panels, as when they reorder, or
  // changes where they show; the browser may lay those boxes out afresh. Read like focus, before
  // the update is committed.
  const previousLayout = useRef(layout);
  const scrollsBefore = useRef<ScrollPosition[]>([]);
  if (layout !== previousLayout.current && row.current)
    scrollsBefore.current = readScrollPositions(row.current);

  // Content is rendered by the application; internal updates, such as a resize, reuse the same
  // elements, so they do not render the panels' content again.
  const contents = useMemo(
    () => new Map(panels.map((panel) => [panel.id, children(panel)] as const)),
    [panels, children],
  );

  function heightOf(panel: T): { height?: number; bounds?: HeightBounds } {
    const requested = panel.height ?? chosenHeights.get(panel.id);
    if (!measurements) return { height: requested };
    const { rem, room } = measurements;
    const max = Math.floor(Math.max(0, Math.min(panel.maxHeight ?? Infinity, room)));
    const min = Math.round(Math.min(panel.minHeight ?? minHeightRem * rem, max));
    const fallback = Math.min(room * defaultHeightShare, defaultHeightRem * rem);
    return { height: clampRound(requested ?? fallback, min, max), bounds: { min, max, room } };
  }

  function bringForward(id: string) {
    recency.current.set(id, ++clock.current);
  }

  function activate(panel: T) {
    if (placements.get(panel.id) === 'hidden') return;
    bringForward(panel.id);
    if (!panel.active) latest.current.onActivate?.(panel.id);
  }

  /**
   * With overflow="minimize", fits the open panels to the row. Where they cannot all sit side by
   * side at their minimum widths, the dock asks to minimize the least recently active one, never
   * the active panel, the newest or the one that holds focus, and only where that lets the rest fit. Once the region widens
   * past the room the row had when the dock minimized a panel, and the panel fits again at its
   * width while open, it asks to open it, the most recently active first. It asks for one change at
   * a time and waits for the answer; a panel the application keeps open, or opens again itself, is
   * not asked for again until the region changes size.
   */
  function fitRow(rowElement: HTMLElement) {
    if (overflow !== 'minimize' || rowElement.getClientRects().length === 0) return;
    const room = rowRoom(rowElement);
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
    if (stacked || stacksNow()) return;
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
      const newestInRow = newest(inRow, recency.current);
      const focus = locateFocus(root.current, focusedPanel.current);
      const focusedId = focus && !focus.tab ? focus.id : undefined;
      const stays = (panel: T) =>
        panel.active ||
        panel === newestInRow ||
        panel.id === focusedId ||
        keptOpen.current.has(panel.id);
      if (!fit(inRow.filter(stays))) return;
      const others = inRow.filter((panel) => !stays(panel));
      const leaving = oldest(others, recency.current);
      if (!leaving) return;
      minimizedForRoom.current.set(leaving.id, {
        time: recency.current.get(leaving.id),
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
    latest.current.onModeChange(panel.id, mode);
  }

  function restoreFromTab(panel: T) {
    pendingRestore.current = panel.id;
    bringForward(panel.id);
    // A stacked dock shows the panel brought forward, even without an active panel.
    if (stacked) tabChoice.current = { id: panel.id, active: activeId, time: clock.current };
    // People brought the panel back: the dock leaves it to them from now on.
    minimizedForRoom.current.delete(panel.id);
    if (panel.mode === 'minimized') latest.current.onModeChange(panel.id, 'open');
    if (!panel.active) latest.current.onActivate?.(panel.id);
    refresh();
  }

  /**
   * A panel that moves or changes where it shows keeps its scroll positions, which the browser
   * resets to the start as it lays the boxes out afresh. They are put back as the update is
   * committed, before the panels' content runs its own effects, so content that scrolls itself in
   * the same update, such as a chat showing a new message or going back to its start, keeps the
   * position it chose.
   */
  function restoreScrollPositions() {
    if (previousLayout.current === layout) return;
    previousLayout.current = layout;
    const positions = scrollsBefore.current;
    scrollsBefore.current = [];
    for (const { element, top, left } of positions) {
      if (!element.isConnected) continue;
      if (element.scrollTop === 0 && top !== 0) element.scrollTop = top;
      if (element.scrollLeft === 0 && left !== 0) element.scrollLeft = left;
    }
  }

  function resize(panel: T, height: number) {
    if (panel.height === undefined)
      setChosenHeights((current) =>
        current.get(panel.id) === height ? current : new Map(current).set(panel.id, height),
      );
    latest.current.onHeightChange?.(panel.id, height);
  }

  function frameOf(id: string) {
    return [...(row.current?.children ?? [])].find(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element.dataset.panelId === id,
    );
  }

  /** Whether the dock is narrower than stackBelow, as laid out now. */
  function stacksNow() {
    const element = root.current;
    const threshold = probe.current;
    return Boolean(element && threshold && element.offsetWidth < threshold.offsetWidth);
  }

  function tabButtonOf(id: string | undefined) {
    const tab = [...(strip.current?.children ?? [])].find(
      (element) => element instanceof HTMLElement && element.dataset.panelId === id,
    );
    return tab?.querySelector<HTMLButtonElement>('.env-panel-dock-tab-restore') ?? undefined;
  }

  function focusInto(id: string) {
    const frame = frameOf(id);
    if (!frame) return;
    const last = lastFocused.current.get(id);
    if (last?.isConnected && frame.contains(last)) {
      last.focus({ preventScroll: true });
      if (last.ownerDocument.activeElement === last) {
        revealInWindow(frame.ownerDocument.defaultView, revealInContent(frame, last));
        return;
      }
    }
    frame.focus({ preventScroll: true });
    revealInWindow(frame.ownerDocument.defaultView, frame.getBoundingClientRect());
  }

  /**
   * Focuses a tab's button. A browser would scroll it into view as it likes, some to the middle of
   * the window; the page scrolls only where the tab lies entirely outside it, and as little as shows
   * it.
   */
  function focusTab(id: string | undefined) {
    const button = tabButtonOf(id);
    if (!button) return;
    button.focus({ preventScroll: true });
    revealInWindow(button.ownerDocument.defaultView, button.getBoundingClientRect());
  }

  /** Once the focused panel or tab leaves: the active or newest panel shown, or the last tab. */
  function focusRemaining() {
    const visible = panels.filter((panel) => placements.get(panel.id) !== 'hidden');
    const target =
      visible.find((panel) => panel.active) ??
      visible.filter((panel) => placements.get(panel.id) === 'row').at(-1) ??
      filling;
    if (target) focusInto(target.id);
    else focusTab(tabs.at(-1)?.id);
  }

  // The dock measures itself: below stackBelow it stacks, and open panels fit the room above the
  // tabs. A rem or em threshold follows the text size.
  useLayoutEffect(() => {
    const element = root.current;
    const threshold = probe.current;
    const rowElement = row.current;
    if (!element || !threshold || !rowElement) return;
    const measure = () => {
      // A hidden dock, such as one in a hidden tab panel, has no box to measure; it keeps its
      // layout until it shows again.
      if (element.getClientRects().length === 0) return;
      const view = element.ownerDocument.defaultView;
      setStacked(stacksNow());
      const fontSize = view?.getComputedStyle(element.ownerDocument.documentElement).fontSize;
      const rem = parseFloat(fontSize ?? '') || 16;
      const gutter = parseFloat(view?.getComputedStyle(rowElement).paddingBlockStart ?? '') || 0;
      const tabsSize = strip.current?.offsetHeight ?? 0;
      const room = Math.max(0, element.clientHeight - tabsSize - gutter);
      setMeasurements((current) =>
        current?.rem === rem && current.room === room ? current : { rem, room },
      );
      setOverflowing(overflows(rowElement));
      if (atRowEnd.current) scrollToRowEnd(rowElement);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    // A dock that minimizes renders again as it resizes, once a frame however often the observer
    // reports, also where nothing it shows changed, so that its row's effect fits the panels: the
    // application's answer to a change asked there renders at once.
    let frameRequest = 0;
    const observer = new ResizeObserver(() => {
      measure();
      if (overflow !== 'minimize' || frameRequest !== 0) return;
      frameRequest = requestAnimationFrame(() => {
        frameRequest = 0;
        refresh();
      });
    });
    observer.observe(element);
    observer.observe(threshold);
    if (strip.current) observer.observe(strip.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRequest);
    };
    // Stacking changes the row's padding above open panels in front of a maximized one, and with it
    // their room, without resizing anything the observer watches.
  }, [stackBelow, hasTabs, filled, stacked, overflow, setStacked, setOverflowing]);

  useStackedReport(stacked, onStackedChange);

  // Shown panels keep the time they appeared; minimized and closed ones are forgotten, so a panel
  // brought back is the newest again.
  useLayoutEffect(() => {
    const shownIds = new Set<string>();
    for (const panel of panels) {
      if (panel.mode === 'minimized') continue;
      shownIds.add(panel.id);
      if (recency.current.has(panel.id)) continue;
      // A panel the dock brings back once it fits again returns to its place among the others.
      const request = awaiting.current;
      const earlier =
        request?.id === panel.id && request.mode === 'open'
          ? minimizedForRoom.current.get(panel.id)?.time
          : undefined;
      if (earlier === undefined) bringForward(panel.id);
      else recency.current.set(panel.id, earlier);
    }
    for (const id of recency.current.keys()) if (!shownIds.has(id)) recency.current.delete(id);
    const ids = new Set(panels.map(({ id }) => id));
    for (const id of lastFocused.current.keys()) if (!ids.has(id)) lastFocused.current.delete(id);
    if ([...chosenHeights.keys()].some((id) => !ids.has(id)))
      setChosenHeights(
        (current) =>
          new Map([...current].filter(([id]) => ids.has(id))) as ReadonlyMap<string, number>,
      );
  }, [panels, chosenHeights]);

  // A tab's choice that no longer holds is forgotten, so it never returns with an earlier state,
  // such as the panel that was active when it was made; one a newer panel took over now is that
  // panel's.
  useLayoutEffect(() => {
    const choice = tabChoice.current;
    if (!choice || chosen === choice.id) return;
    tabChoice.current =
      chosen === undefined
        ? null
        : { id: chosen, active: activeId, time: recency.current.get(chosen) ?? clock.current };
  });

  // A panel that joins the row scrolls into view, so the newest shows while the row overflows.
  useLayoutEffect(() => {
    const rowElement = row.current;
    if (!rowElement) return;
    const before = new Set(previousRow.current);
    previousRow.current = rowIds;
    const joined = rowIds.filter((id) => !before.has(id)).at(-1);
    const frame = joined === undefined ? undefined : frameOf(joined);
    if (frame) reveal(rowElement, frame);
    setOverflowing(overflows(rowElement));
    fitRow(rowElement);
  });

  // Focus follows a panel's content: a panel that hides hands focus to its tab, a panel brought
  // back takes it again where it was, and a panel moved by a reorder keeps it.
  useLayoutEffect(() => {
    const element = root.current;
    const tabsBefore = previousTabs.current;
    previousTabs.current = tabs.map(({ id }) => id);
    const restoring = pendingRestore.current;
    pendingRestore.current = null;
    if (!element) return;
    const page = element.ownerDocument;
    const focused = page.activeElement;
    const lost = !focused || focused === page.body || !focused.isConnected;
    if (restoring !== null && isShown(placements.get(restoring))) {
      focusInto(restoring);
      return;
    }
    if (!focusBefore) return;
    const placement = placements.get(focusBefore.id);
    if (focusBefore.tab) {
      if (!lost) return;
      if (placement === undefined) {
        const index = tabsBefore.indexOf(focusBefore.id);
        const next = tabs[Math.min(index, tabs.length - 1)];
        if (next) focusTab(next.id);
        else focusRemaining();
      } else if (isShown(placement)) focusInto(focusBefore.id);
      return;
    }
    if (placement === undefined) {
      if (lost) focusRemaining();
    } else if (placement === 'hidden') {
      // Focus in a popup the panel opened, such as a menu in a portal, moves to the tab too.
      if (lost || focusBefore.popup || frameOf(focusBefore.id)?.contains(focused))
        focusTab(focusBefore.id);
    } else if (lost) {
      // A reorder can drop focus from an element that stays. An element that went with the new
      // layout, such as the resize handle of a panel that now fills the region, or Maximize in a
      // stacked dock, leaves focus to its panel.
      if (focusBefore.element.isConnected) focusBefore.element.focus({ preventScroll: true });
      else focusInto(focusBefore.id);
    }
  });

  // A vertical wheel scrolls an overflowing strip of tabs sideways.
  useEffect(() => {
    const element = strip.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (event.deltaX !== 0 || event.deltaY === 0 || event.ctrlKey) return;
      const max = element.scrollWidth - element.clientWidth;
      if (max <= 0) return;
      const direction = getComputedStyle(element).direction === 'rtl' ? -1 : 1;
      const position = element.scrollLeft * direction;
      const next = Math.min(max, Math.max(0, position + event.deltaY));
      if (next === position) return;
      event.preventDefault();
      element.scrollLeft = next * direction;
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [hasTabs]);

  return (
    <div
      {...props}
      ref={(node) => {
        root.current = node;
        setRef(ref, node);
      }}
      className={classNames('env-panel-dock', className)}
      data-stacked={stacked || undefined}
      data-filled={filled || undefined}
      data-tabs={hasTabs || undefined}
    >
      <div
        ref={row}
        className="env-panel-dock-row"
        data-overflowing={overflowing || undefined}
        onScroll={(event) => {
          atRowEnd.current = isAtRowEnd(event.currentTarget);
        }}
      >
        <BeforeContent onLayout={restoreScrollPositions} />
        {panels.map((panel) => {
          const placement = placements.get(panel.id)!;
          const { height, bounds } = heightOf(panel);
          return (
            <PanelFrame
              key={panel.id}
              panel={panel}
              placement={placement}
              stacked={stacked}
              height={height}
              bounds={placement === 'row' ? bounds : undefined}
              content={contents.get(panel.id)}
              resizeLabel={nameResize(panel.title)}
              changeMode={changeMode}
              close={close}
              onActivate={() => activate(panel)}
              onFocusWithin={(element) => {
                if (element) focusedPanel.current = { id: panel.id, element };
                else if (focusedPanel.current?.id === panel.id) focusedPanel.current = null;
              }}
              onFocusContent={(target) => lastFocused.current.set(panel.id, target)}
              onResize={(next) => resize(panel, next)}
            />
          );
        })}
      </div>
      {hasTabs && (
        <ul ref={strip} className="env-panel-dock-strip" aria-label={tabsLabel}>
          {tabs.map((panel) => (
            <PanelTab
              key={panel.id}
              panel={panel}
              showLabel={nameShow}
              closeLabel={nameClose}
              onRestore={() => restoreFromTab(panel)}
              onClose={() => close(panel.id)}
            />
          ))}
        </ul>
      )}
      <div
        ref={probe}
        className="env-panel-dock-probe"
        aria-hidden="true"
        style={{ inlineSize: cssLength(stackBelow) }}
      />
    </div>
  );
}

/**
 * A state whose setter renders only for a value other than the one it set last: setting a state to
 * the value it has can still render a component again, as measurements on every resize would.
 */
function useChangingState<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const last = useRef(initial);
  const change = useCallback((next: T) => {
    if (Object.is(last.current, next)) return;
    last.current = next;
    setValue(next);
  }, []);
  return [value, change] as const;
}

/**
 * Renders nothing. As the first child of the row, its layout effect runs before those of the
 * panels' content, which React runs in the order of the tree.
 */
function BeforeContent({ onLayout }: { onLayout: () => void }) {
  useLayoutEffect(onLayout);
  return null;
}
