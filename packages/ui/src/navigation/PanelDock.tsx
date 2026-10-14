import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { cssLength } from '../internal/cssLength.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { setRef } from '../internal/setRef.js';
import { useHydrated } from '../internal/useHydrated.js';
import { useStackedReport } from '../internal/useStackedReport.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { Close } from '../icons/Close.js';
import {
  PanelDockPanelContext,
  type PanelDockMode,
  type PanelDockPanelContextValue,
} from './internal/PanelDockContext.js';

export type { PanelDockMode };

export interface PanelDockPanel {
  /** Stable, unique identifier; the panel and its chip carry it as data-panel-id. */
  id: string;
  /** The panel's name: the accessible name of its region, and the text of its chip. */
  title: string;
  /**
   * open: side by side with the other open panels at the bottom inline-end; minimized: a chip in
   * the strip along the bottom; maximized: filling the region.
   */
  mode: PanelDockMode;
  /**
   * Height of the open panel in pixels. Without it, the panel starts at 85% of the room above the
   * chips, up to 40 rem, and keeps the height people choose.
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
  /** The greatest height people can resize the panel to, in pixels; the room above the chips. */
  maxHeight?: number;
  /** The panel people work in: in front of the other open panels, and shown by a stacked dock. */
  active?: boolean;
  /** Text of the chip, where a shorter one helps; the title by default. */
  label?: string;
  /** A leading icon on the chip. */
  icon?: ReactNode;
  /** Shows a dot on the chip and describes it with this text, such as Unsaved changes. */
  attention?: string;
  /** Tooltip content of the chip, such as the full title with a detail. */
  tooltip?: ReactNode;
}

export interface PanelDockProps<T extends PanelDockPanel>
  extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The panels in order; open panels sit side by side and chips follow in the same order. */
  panels: readonly T[];
  /** Renders a panel's content, such as a PanelDockHeader above the panel's body. */
  children: (panel: T) => ReactNode;
  /**
   * Called with the mode a panel asks for, from its window controls and its chip, and from the dock
   * itself with overflow="minimize".
   */
  onModeChange: (id: string, mode: PanelDockMode) => void;
  /** Called from a panel's close control and its chip's close button. */
  onClose: (id: string) => void;
  /**
   * Called when people press or focus inside a panel that is not active, and when its chip brings
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
   * is narrower, one panel at a time fills it and the others wait as chips. The dock then has
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
   * Accessible name of the list of chips, which holds minimized panels and the panels a stacked dock
   * leaves out; Hidden panels by default.
   */
  minimizedLabel?: string;
  /**
   * Accessible name of a chip's button that shows its panel, from the chip's text: Show and the text
   * by default. A function, as each chip names its own panel; PanelDockControls takes plain strings.
   */
  showLabel?: (label: string) => string;
  /** Accessible name of a chip's close button, from the chip's text: Close and the text by default. */
  closeLabel?: (label: string) => string;
  /** Accessible name of a panel's resize handle, from its title: Resize and the title by default. */
  resizeLabel?: (title: string) => string;
}

/** Where a panel shows: in the row, filling the region, or out of sight behind its chip. */
type Placement = 'row' | 'fill' | 'hidden';

interface HeightBounds {
  min: number;
  max: number;
  /** The block size open panels have above the chips. */
  room: number;
}

interface ScrollPosition {
  element: Element;
  top: number;
  left: number;
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

/** A chip's press in a stacked dock: the panel to show, the panel active then, and when. */
interface ChipChoice {
  id: string;
  active: string | undefined;
  /** The time the chip brought its panel forward, on the dock's clock of recency. */
  time: number;
}

/** The panel whose content, or a popup it opened, took focus last, and the element that took it. */
interface FocusedPanel {
  id: string;
  element: EventTarget;
}

interface Measurements {
  /** Pixels per rem. */
  rem: number;
  /** The block size open panels have above the chips, in pixels. */
  room: number;
}

// Words that fit a minimized panel and one a stacked dock leaves out alike.
const defaultShowLabel = (label: string) => `Show ${label}`;
const defaultCloseLabel = (label: string) => `Close ${label}`;
const defaultResizeLabel = (title: string) => `Resize ${title}`;

/** A panel without a height takes this share of the room, up to defaultHeightRem. */
const defaultHeightShare = 0.85;
const defaultHeightRem = 40;
const minHeightRem = 15;
const resizeStep = 16;
const resizeLargeStep = 64;
/** How long a dock with overflow="minimize" waits for an answer, in milliseconds. */
const answerTimeout = 5_000;

/**
 * Panels docked to the bottom inline-end edge of a region, beside the page, for items people work
 * on alongside it, such as drafts and conversations: open panels side by side, one maximized panel
 * filling the region, and minimized panels as chips. A panel's content stays mounted through every
 * change of mode and order.
 */
export function PanelDock<T extends PanelDockPanel>({
  panels,
  children,
  onModeChange,
  onClose,
  onActivate,
  onHeightChange,
  stackBelow = '40rem',
  onStackedChange,
  overflow = 'scroll',
  minimizedLabel = 'Hidden panels',
  showLabel = defaultShowLabel,
  closeLabel = defaultCloseLabel,
  resizeLabel = defaultResizeLabel,
  className,
  ref,
  ...props
}: PanelDockProps<T>) {
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
  // A panel its chip asked to bring back, which takes focus once it shows.
  const pendingRestore = useRef<string | null>(null);
  // The panel a chip asked a stacked dock to show, also where the application does not activate
  // panels, until the situation it was asked in changes.
  const chipChoice = useRef<ChipChoice | null>(null);
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
  const previousChips = useRef<readonly string[]>([]);
  const [stacked, setStacked] = useState(false);
  const [measurements, setMeasurements] = useState<Measurements>();
  const [overflowing, setOverflowing] = useState(false);
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

  // A stacked dock fills the region with one shown panel: the one its chip asked for, else the
  // active one, else the newest; a wide one with its maximized panel. The others wait behind their
  // chips.
  const maximized = panels.filter((panel) => panel.mode === 'maximized');
  const shown = stacked ? panels.filter((panel) => panel.mode !== 'minimized') : maximized;
  const activeId = panels.find((panel) => panel.active)?.id;
  const chosen = stacked
    ? heldChoice(chipChoice.current, panels, activeId, recency.current)
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
  const chips = panels.filter((panel) => placements.get(panel.id) === 'hidden');
  const rowIds = panels.filter((panel) => placements.get(panel.id) === 'row').map(({ id }) => id);
  const layout = panels.map(({ id }) => `${id}:${placements.get(id)}`).join('\n');
  const hasChips = chips.length > 0;
  const filled = filling !== undefined;
  // Where focus is before this update is committed, read while a panel or chip that is about to
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
      // from its chip, also alone in the row, the one that holds focus, as where people type, and
      // any the application kept open. Where those cannot fit by themselves, minimizing the others
      // would only hide them, and the row scrolls.
      const newestInRow = newest(inRow, recency.current);
      const focus = locateFocus(root.current, focusedPanel.current);
      const focusedId = focus && !focus.chip ? focus.id : undefined;
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

  function restoreFromChip(panel: T) {
    pendingRestore.current = panel.id;
    bringForward(panel.id);
    // A stacked dock shows the panel brought forward, even without an active panel.
    if (stacked) chipChoice.current = { id: panel.id, active: activeId, time: clock.current };
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

  function chipButtonOf(id: string | undefined) {
    const chip = [...(strip.current?.children ?? [])].find(
      (element) => element instanceof HTMLElement && element.dataset.panelId === id,
    );
    return chip?.querySelector<HTMLButtonElement>('.env-panel-dock-chip-restore') ?? undefined;
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
   * Focuses a chip's button. A browser would scroll it into view as it likes, some to the middle of
   * the window; the page scrolls only where the chip lies entirely outside it, and as little as shows
   * it.
   */
  function focusChip(id: string | undefined) {
    const button = chipButtonOf(id);
    if (!button) return;
    button.focus({ preventScroll: true });
    revealInWindow(button.ownerDocument.defaultView, button.getBoundingClientRect());
  }

  /** Once the focused panel or chip leaves: the active or newest panel shown, or the last chip. */
  function focusRemaining() {
    const visible = panels.filter((panel) => placements.get(panel.id) !== 'hidden');
    const target =
      visible.find((panel) => panel.active) ??
      visible.filter((panel) => placements.get(panel.id) === 'row').at(-1) ??
      filling;
    if (target) focusInto(target.id);
    else focusChip(chips.at(-1)?.id);
  }

  // The dock measures itself: below stackBelow it stacks, and open panels fit the room above the
  // chips. A rem or em threshold follows the text size.
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
      const chipsSize = strip.current?.offsetHeight ?? 0;
      const room = Math.max(0, element.clientHeight - chipsSize - gutter);
      setMeasurements((current) =>
        current?.rem === rem && current.room === room ? current : { rem, room },
      );
      setOverflowing(overflows(rowElement));
      if (atRowEnd.current) scrollToRowEnd(rowElement);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    // A dock that minimizes renders again as it resizes, also where nothing it shows changed, so
    // that its row's effect fits the panels: the application's answer to a change asked there
    // renders at once, before the dock stops awaiting it.
    const observer = new ResizeObserver(() => {
      measure();
      if (overflow === 'minimize') refresh();
    });
    observer.observe(element);
    observer.observe(threshold);
    if (strip.current) observer.observe(strip.current);
    return () => observer.disconnect();
    // Stacking changes the row's padding above open panels in front of a maximized one, and with it
    // their room, without resizing anything the observer watches.
  }, [stackBelow, hasChips, filled, stacked, overflow]);

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

  // A chip's choice that no longer holds is forgotten, so it never returns with an earlier state,
  // such as the panel that was active when it was made; one a newer panel took over now is that
  // panel's.
  useLayoutEffect(() => {
    const choice = chipChoice.current;
    if (!choice || chosen === choice.id) return;
    chipChoice.current =
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

  // Focus follows a panel's content: a panel that hides hands focus to its chip, a panel brought
  // back takes it again where it was, and a panel moved by a reorder keeps it.
  useLayoutEffect(() => {
    const element = root.current;
    const chipsBefore = previousChips.current;
    previousChips.current = chips.map(({ id }) => id);
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
    if (focusBefore.chip) {
      if (!lost) return;
      if (placement === undefined) {
        const index = chipsBefore.indexOf(focusBefore.id);
        const next = chips[Math.min(index, chips.length - 1)];
        if (next) focusChip(next.id);
        else focusRemaining();
      } else if (isShown(placement)) focusInto(focusBefore.id);
      return;
    }
    if (placement === undefined) {
      if (lost) focusRemaining();
    } else if (placement === 'hidden') {
      // Focus in a popup the panel opened, such as a menu in a portal, moves to the chip too.
      if (lost || focusBefore.popup || frameOf(focusBefore.id)?.contains(focused))
        focusChip(focusBefore.id);
    } else if (lost) {
      // A reorder can drop focus from an element that stays. An element that went with the new
      // layout, such as the resize handle of a panel that now fills the region, or Maximize in a
      // stacked dock, leaves focus to its panel.
      if (focusBefore.element.isConnected) focusBefore.element.focus({ preventScroll: true });
      else focusInto(focusBefore.id);
    }
  });

  // A vertical wheel scrolls an overflowing strip of chips sideways.
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
  }, [hasChips]);

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
      data-chips={hasChips || undefined}
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
              resizeLabel={resizeLabel(panel.title)}
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
      {hasChips && (
        <ul ref={strip} className="env-panel-dock-strip" aria-label={minimizedLabel}>
          {chips.map((panel) => (
            <PanelChip
              key={panel.id}
              panel={panel}
              showLabel={showLabel}
              closeLabel={closeLabel}
              onRestore={() => restoreFromChip(panel)}
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
 * Renders nothing. As the first child of the row, its layout effect runs before those of the
 * panels' content, which React runs in the order of the tree.
 */
function BeforeContent({ onLayout }: { onLayout: () => void }) {
  useLayoutEffect(onLayout);
  return null;
}

interface PanelFrameProps {
  panel: PanelDockPanel;
  placement: Placement;
  stacked: boolean;
  /** The panel's height in pixels; before the dock measures itself, the requested one, if any. */
  height: number | undefined;
  /** Resize bounds in pixels; only open panels in the row are resized. */
  bounds: HeightBounds | undefined;
  content: ReactNode;
  resizeLabel: string;
  changeMode: (id: string, mode: PanelDockMode) => void;
  close: (id: string) => void;
  onActivate: () => void;
  /**
   * Called with the element that takes focus in the panel's content, including popups it opened,
   * and with null as focus leaves.
   */
  onFocusWithin: (element: EventTarget | null) => void;
  onFocusContent: (target: HTMLElement) => void;
  onResize: (height: number) => void;
}

/** One panel: a labelled region with its content, and a resize handle along its top edge. */
function PanelFrame({
  panel,
  placement,
  stacked,
  height,
  bounds,
  content,
  resizeLabel,
  changeMode,
  close,
  onActivate,
  onFocusWithin,
  onFocusContent,
  onResize,
}: PanelFrameProps) {
  const { id, mode } = panel;
  const frameId = useId();
  const frame = useRef<HTMLElement>(null);
  // The height while the top edge is dragged; it is reported once the drag ends.
  const [preview, setPreview] = useState<number>();
  // The block size of a PanelDockHeader sticking to the top of the content, in pixels.
  const [headerSize, setHeaderSize] = useState(0);
  // Whether the content has scrolled from its top, where a hairline then marks the header, which
  // takes it from the panel's context wherever it sits in the content.
  const [scrolled, setScrolled] = useState(false);
  const drag = useRef<{
    pointerId: number;
    startY: number;
    startHeight: number;
    /** Screen pixels per layout pixel, as in a scaled preview. */
    scale: number;
  }>(null);
  const shownHeight = preview ?? height;
  useEntrance(frame, placement, placement !== 'hidden');
  const context = useMemo<PanelDockPanelContextValue>(
    () => ({
      mode,
      stacked,
      changeMode: (next) => changeMode(id, next),
      close: () => close(id),
      reportHeaderSize: setHeaderSize,
      scrolled,
    }),
    [id, mode, stacked, changeMode, close, scrolled],
  );

  // The top edge resizes only an open panel in the row. When it goes during a drag, as when the
  // panel is maximized or the dock stacks, it takes its pointer events with it: the drag ends
  // there, without a new height, as a cancelled one does.
  const resizable = placement === 'row' && bounds !== undefined;
  useLayoutEffect(() => {
    if (resizable || !drag.current) return;
    drag.current = null;
    setPreview(undefined);
  }, [resizable]);

  function clampHeight(value: number) {
    return bounds ? clampRound(value, bounds.min, bounds.max) : Math.round(value);
  }

  function startResize(event: PointerEvent<HTMLDivElement>) {
    const element = frame.current;
    if (event.button !== 0 || !event.isPrimary || !element || shownHeight === undefined) return;
    // Dragging selects no text and leaves focus where it is.
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: shownHeight,
      scale: element.getBoundingClientRect().height / element.offsetHeight || 1,
    };
    setPreview(shownHeight);
  }

  function dragHeight(current: NonNullable<typeof drag.current>, event: PointerEvent) {
    return clampHeight(current.startHeight + (current.startY - event.clientY) / current.scale);
  }

  function moveResize(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId) return;
    // A button released outside the window can arrive as a move without it.
    if (event.pointerType === 'mouse' && (event.buttons & 1) === 0) endResize(event);
    else setPreview(dragHeight(current, event));
  }

  function endResize(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setPreview(undefined);
    // A cancelled drag, such as one the browser took over for scrolling, keeps the height it began
    // with.
    if (event.type === 'pointercancel' || event.type === 'lostpointercapture') return;
    const next = dragHeight(current, event);
    if (next !== current.startHeight) onResize(next);
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || !bounds || shownHeight === undefined)
      return;
    const step = event.shiftKey ? resizeLargeStep : resizeStep;
    let next: number;
    if (event.key === 'ArrowUp') next = shownHeight + step;
    else if (event.key === 'ArrowDown') next = shownHeight - step;
    else if (event.key === 'Home') next = bounds.min;
    else if (event.key === 'End') next = bounds.max;
    else return;
    event.preventDefault();
    next = clampHeight(next);
    if (next !== shownHeight) onResize(next);
  }

  function noteFocus(event: FocusEvent<HTMLElement>) {
    const target = event.target;
    // Restoring a panel returns to an element in its content, not to the window control that
    // minimized it, nor to the content area, which a press on a control focuses in some browsers.
    if (
      target instanceof HTMLElement &&
      target.parentElement?.closest('.env-panel-dock-content') &&
      !target.closest('.env-panel-dock-controls')
    )
      onFocusContent(target);
    onFocusWithin(target);
    onActivate();
  }

  return (
    <section
      ref={frame}
      id={frameId}
      className="env-panel-dock-panel"
      aria-label={panel.title}
      tabIndex={-1}
      inert={placement === 'hidden'}
      data-panel-id={id}
      data-mode={mode}
      data-placement={placement}
      data-active={panel.active || undefined}
      data-resizing={preview !== undefined || undefined}
      style={
        {
          '--env-panel-dock-panel-width': pixels(panel.preferredWidth),
          '--env-panel-dock-panel-min-width': pixels(panel.minWidth),
          '--env-panel-dock-panel-max-width': pixels(panel.maxWidth),
          '--env-panel-dock-panel-height': pixels(shownHeight),
        } as CSSProperties
      }
      onPointerDownCapture={onActivate}
      onFocus={noteFocus}
      // Focus moving within the panel, or into a popup it opened, is followed by its focus event.
      onBlur={() => onFocusWithin(null)}
    >
      {resizable && shownHeight !== undefined && (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label={resizeLabel}
          aria-controls={frameId}
          aria-valuenow={shownHeight}
          aria-valuemin={bounds.min}
          aria-valuemax={bounds.max}
          // Read as the share of the room above the chips, like SplitView's share of its width.
          aria-valuetext={
            bounds.room > 0 ? `${Math.round((shownHeight / bounds.room) * 100)}%` : undefined
          }
          tabIndex={0}
          className="env-panel-dock-resize"
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          onLostPointerCapture={endResize}
          onKeyDown={resizeWithKeyboard}
        />
      )}
      {/* Pressing the content focuses it, so the keyboard scrolls it; it is not a tab stop of its
          own, as some browsers would make a scrolling element. */}
      <div
        className="env-panel-dock-content"
        tabIndex={-1}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
        style={
          headerSize > 0
            ? ({ '--env-panel-dock-header-size': `${headerSize}px` } as CSSProperties)
            : undefined
        }
      >
        <PanelDockPanelContext value={context}>{content}</PanelDockPanelContext>
      </div>
    </section>
  );
}

interface PanelChipProps {
  panel: PanelDockPanel;
  showLabel: (label: string) => string;
  closeLabel: (label: string) => string;
  onRestore: () => void;
  onClose: () => void;
}

/** A panel out of sight: a button that brings it back and a close button. */
function PanelChip({ panel, showLabel, closeLabel, onRestore, onClose }: PanelChipProps) {
  const descriptionId = useId();
  const chip = useRef<HTMLLIElement>(null);
  useEntrance(chip, 'chip', true);
  const label = panel.label ?? panel.title;
  const attention = Boolean(panel.attention);
  const restore = (
    <button
      type="button"
      className="env-panel-dock-chip-restore"
      aria-label={showLabel(label)}
      aria-describedby={attention ? descriptionId : undefined}
      onClick={onRestore}
    >
      {panel.icon != null && <DecorativeIcon>{panel.icon}</DecorativeIcon>}
      <span className="env-panel-dock-chip-label">{label}</span>
      {attention && <span className="env-panel-dock-chip-attention" aria-hidden="true" />}
    </button>
  );
  return (
    <li
      ref={chip}
      className="env-panel-dock-chip"
      data-panel-id={panel.id}
      data-mode={panel.mode}
      data-attention={attention || undefined}
    >
      {panel.tooltip != null ? <Tooltip content={panel.tooltip}>{restore}</Tooltip> : restore}
      <button
        type="button"
        className="env-panel-dock-chip-close"
        aria-label={closeLabel(label)}
        onClick={onClose}
      >
        <DecorativeIcon>
          <Close />
        </DecorativeIcon>
      </button>
      {attention && (
        <span id={descriptionId} hidden>
          {panel.attention}
        </span>
      )}
    </li>
  );
}

/**
 * Marks a panel's or chip's entrance with data-entering while it plays: when it shows, and again each
 * time it shows in another way, given by key. A reorder moves the element in the document, which
 * starts its CSS animations over; once the attribute is gone, nothing plays again. The attribute is
 * set on the element itself, so the entrance renders nothing. Server output is in place before it
 * hydrates, without an entrance.
 */
function useEntrance(element: RefObject<HTMLElement | null>, key: string, showing: boolean) {
  const hydrated = useHydrated();
  const shownAs = useRef<string>(undefined);
  useLayoutEffect(() => {
    const node = element.current;
    if (!node || shownAs.current === key) return;
    const enters = showing && (shownAs.current !== undefined || hydrated);
    shownAs.current = key;
    if (enters) node.setAttribute('data-entering', '');
    else node.removeAttribute('data-entering');
  });
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const ended = (event: globalThis.AnimationEvent) => {
      // An earlier animation can end late, after a new entrance began; that one keeps running.
      if (
        event.target !== node ||
        node.getAnimations?.().some((animation) => animation.playState === 'running')
      )
        return;
      node.removeAttribute('data-entering');
    };
    node.addEventListener('animationend', ended);
    return () => node.removeEventListener('animationend', ended);
  }, [element]);
}

/**
 * The panel or chip of this dock that holds focus, read before an update is committed: focus in the
 * dock, or elsewhere in a popup that the panel whose content last took focus opened.
 */
function locateFocus(dock: HTMLElement | null, focusedPanel: FocusedPanel | null) {
  const page = dock?.ownerDocument;
  const focused = page?.activeElement;
  if (!dock || !(focused instanceof HTMLElement) || focused === page?.body) return null;
  if (!dock.contains(focused))
    return focusedPanel?.element === focused
      ? { id: focusedPanel.id, chip: false, popup: true, element: focused }
      : null;
  const owner = focused.closest<HTMLElement>('.env-panel-dock-panel, .env-panel-dock-chip');
  if (!owner || owner.closest('.env-panel-dock') !== dock || owner.dataset.panelId === undefined)
    return null;
  return {
    id: owner.dataset.panelId,
    chip: owner.classList.contains('env-panel-dock-chip'),
    popup: false,
    element: focused,
  };
}

/**
 * The panel a chip asked a stacked dock to show, while that choice holds, as long as the same panel
 * is active: that panel while it is there, or the panel that appeared or was brought forward last
 * since, which takes the choice over, so a panel that opens shows. A panel not recorded yet has just
 * appeared.
 */
function heldChoice(
  choice: ChipChoice | null,
  panels: readonly PanelDockPanel[],
  activeId: string | undefined,
  times: Map<string, number>,
) {
  if (!choice || choice.active !== activeId) return undefined;
  let held = panels.some((panel) => panel.id === choice.id) ? choice.id : undefined;
  let latest = choice.time;
  for (const panel of panels) {
    if (panel.id === choice.id || panel.mode === 'minimized') continue;
    const time = times.get(panel.id) ?? Infinity;
    if (time > latest) {
      held = panel.id;
      latest = time;
    }
  }
  return held;
}

/** The candidate that appeared or was brought forward last; one never recorded is the newest. */
function newest<T extends PanelDockPanel>(candidates: readonly T[], times: Map<string, number>) {
  let found: T | undefined;
  let latest = -Infinity;
  for (const panel of candidates) {
    const time = times.get(panel.id) ?? Infinity;
    if (time >= latest) {
      found = panel;
      latest = time;
    }
  }
  return found;
}

/** The candidate brought forward longest ago; of those never recorded, the first. */
function oldest<T extends PanelDockPanel>(candidates: readonly T[], times: Map<string, number>) {
  let found: T | undefined;
  let earliest = Infinity;
  for (const panel of candidates) {
    const time = times.get(panel.id) ?? Infinity;
    if (!found || time < earliest) {
      found = panel;
      earliest = time;
    }
  }
  return found;
}

/** The elements inside the panels that are scrolled away from their start. */
function readScrollPositions(rowElement: Element) {
  const positions: ScrollPosition[] = [];
  for (const element of rowElement.querySelectorAll('*'))
    if (element.scrollTop !== 0 || element.scrollLeft !== 0)
      positions.push({ element, top: element.scrollTop, left: element.scrollLeft });
  return positions;
}

/**
 * Brings an element that the panel hides entirely into view, also one beneath the sticky header,
 * inside a list that scrolls on its own or beside the view. Only the panel's own scrolling elements
 * scroll, as little as shows it, from the innermost out: lists or rows inside the content, then the
 * content. One that partly shows keeps the scroll positions people left. Returns the part of the
 * element that shows.
 */
function revealInContent(frame: HTMLElement, element: HTMLElement) {
  const content = frame.querySelector<HTMLElement>(':scope > .env-panel-dock-content');
  if (!content?.contains(element)) return element.getBoundingClientRect();
  const scrollers: HTMLElement[] = [];
  for (let box = element.parentElement; box && box !== content; box = box.parentElement)
    if (scrollsOverflow(box)) scrollers.push(box);
  scrollers.push(content);
  if (!shownPart(element, scrollers))
    for (const scroller of scrollers) {
      const area = viewArea(scroller);
      const target = element.getBoundingClientRect();
      scroller.scrollTop += nearestScroll(target.top, target.bottom, area.top, area.bottom);
      scroller.scrollLeft += nearestScroll(target.left, target.right, area.left, area.right);
    }
  return shownPart(element, scrollers) ?? element.getBoundingClientRect();
}

/**
 * Scrolls the page alone, as little as shows it, to the part of a focused element that shows,
 * where that lies entirely outside the window, as where the dock is partly out of view, so focus
 * never goes out of sight; where some of it shows in the window, the page stays where people left
 * it.
 */
function revealInWindow(view: Window | null, shown: Area) {
  if (!view) return;
  if (
    shown.bottom > 0 &&
    shown.top < view.innerHeight &&
    shown.right > 0 &&
    shown.left < view.innerWidth
  )
    return;
  view.scrollBy({
    top: nearestScroll(shown.top, shown.bottom, 0, view.innerHeight),
    left: nearestScroll(shown.left, shown.right, 0, view.innerWidth),
  });
}

/** Whether an element scrolls content that overflows it, on either axis. */
function scrollsOverflow(element: HTMLElement) {
  const style = getComputedStyle(element);
  const scrolls = (value: string) => value === 'auto' || value === 'scroll' || value === 'hidden';
  return (
    (scrolls(style.overflowY) && element.scrollHeight > element.clientHeight) ||
    (scrolls(style.overflowX) && element.scrollWidth > element.clientWidth)
  );
}

/** An area in the viewport, in pixels. */
interface Area {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Where a scrolling element shows its content, within its scroll padding, in the viewport. */
function viewArea(scroller: HTMLElement): Area {
  const box = scroller.getBoundingClientRect();
  const style = getComputedStyle(scroller);
  const top = box.top + scroller.clientTop;
  const left = box.left + scroller.clientLeft;
  return {
    top: top + (parseFloat(style.scrollPaddingTop) || 0),
    bottom: top + scroller.clientHeight - (parseFloat(style.scrollPaddingBottom) || 0),
    left: left + (parseFloat(style.scrollPaddingLeft) || 0),
    right: left + scroller.clientWidth - (parseFloat(style.scrollPaddingRight) || 0),
  };
}

/** The part of an element that shows through every one of these scrolling elements, if any. */
function shownPart(element: HTMLElement, scrollers: readonly HTMLElement[]): Area | undefined {
  let { top, bottom, left, right } = element.getBoundingClientRect();
  for (const scroller of scrollers) {
    const area = viewArea(scroller);
    top = Math.max(top, area.top);
    bottom = Math.min(bottom, area.bottom);
    left = Math.max(left, area.left);
    right = Math.min(right, area.right);
  }
  return bottom > top && right > left ? { top, bottom, left, right } : undefined;
}

/**
 * How far to scroll on one axis so a span shows in an area: as little as shows it, and from its
 * start where it is larger than the area.
 */
function nearestScroll(start: number, end: number, areaStart: number, areaEnd: number) {
  if (start < areaStart) return start - areaStart;
  if (end > areaEnd) return Math.min(start - areaStart, end - areaEnd);
  return 0;
}

function isShown(placement: Placement | undefined) {
  return placement === 'row' || placement === 'fill';
}

function clampRound(value: number, min: number, max: number) {
  return Math.round(Math.min(max, Math.max(min, value)));
}

function pixels(value: number | undefined) {
  return value === undefined ? undefined : `${value}px`;
}

/** The inline size the row has for its panels, and the gap between them, in pixels. */
function rowRoom(rowElement: HTMLElement) {
  const style = getComputedStyle(rowElement);
  const padding =
    (parseFloat(style.paddingInlineStart) || 0) + (parseFloat(style.paddingInlineEnd) || 0);
  return { size: rowElement.clientWidth - padding, gap: parseFloat(style.columnGap) || 0 };
}

/** Whether panels of these minimum widths fit side by side in the row. */
function fitsInRow(room: { size: number; gap: number }, widths: readonly number[]) {
  let total = -room.gap;
  for (const width of widths) total += width + room.gap;
  return total <= room.size + 1;
}

/** The narrowest a panel gets in the row, with its borders and margins. */
function minimumWidth(frame: HTMLElement | undefined) {
  if (!frame) return 0;
  const style = getComputedStyle(frame);
  const length = (value: string) => parseFloat(value) || 0;
  const edges =
    style.boxSizing === 'border-box'
      ? 0
      : length(style.borderInlineStartWidth) +
        length(style.borderInlineEndWidth) +
        length(style.paddingInlineStart) +
        length(style.paddingInlineEnd);
  return (
    length(style.minInlineSize) +
    edges +
    length(style.marginInlineStart) +
    length(style.marginInlineEnd)
  );
}

function overflows(rowElement: HTMLElement) {
  return rowElement.scrollWidth - rowElement.clientWidth > 1;
}

function isAtRowEnd(rowElement: HTMLElement) {
  return rowElement.scrollWidth - rowElement.clientWidth - Math.abs(rowElement.scrollLeft) <= 1;
}

function scrollToRowEnd(rowElement: HTMLElement) {
  const end = rowElement.scrollWidth - rowElement.clientWidth;
  rowElement.scrollLeft = getComputedStyle(rowElement).direction === 'rtl' ? -end : end;
}

/** Scrolls the row, and only the row, so the frame shows between its padding edges. */
function reveal(rowElement: HTMLElement, frame: HTMLElement) {
  const style = getComputedStyle(rowElement);
  const area = rowElement.getBoundingClientRect();
  const start = area.left + parseFloat(style.paddingLeft);
  const end = area.right - parseFloat(style.paddingRight);
  const box = frame.getBoundingClientRect();
  if (box.right > end) rowElement.scrollLeft += box.right - end;
  else if (box.left < start) rowElement.scrollLeft -= start - box.left;
}
