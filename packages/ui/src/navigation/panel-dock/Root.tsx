'use client';

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { classNames } from '../../internal/classNames.js';
import { Column, Row } from '../../foundations/Layout.js';
import { remLength } from '../../internal/cssLength.js';
import { roundToHundredth } from '../../internal/lengths.js';
import { setRef } from '../../internal/setRef.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { useStackedReport } from '../../internal/useStackedReport.js';
import { panelDock as panelDockMessages } from '../../foundations/messages/panelDock.js';
import type { PanelDockMode } from './internal/PanelDockPanelContext.js';
import {
  clampRound,
  heldChoice,
  isAtRowEnd,
  isShown,
  locateFocus,
  newest,
  overflows,
  readScrollPositions,
  reveal,
  revealInContent,
  revealInWindow,
  scrollToRowEnd,
  type FocusedPanel,
  type HeightBounds,
  type Placement,
  type ScrollPosition,
  type TabChoice,
} from './internal/dockLayout.js';
import { PanelFrame } from './internal/PanelFrame.js';
import { PanelTab } from './internal/PanelTab.js';
import { useDockOverflow } from './internal/useDockOverflow.js';
import { useStripWheel } from './internal/useStripWheel.js';
import { flag } from '../../internal/flag.js';
import '../../styles/Base.css';
import '../../styles/PanelDock.css';

export type { PanelDockMode };

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

export interface RootProps<Panel extends PanelDockPanel = PanelDockPanel> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  /**
   * The panels in order, each a PanelDockPanel: open panels sit side by side, the newest at the
   * end, and tabs follow in the same order. The application owns them.
   */
  panels: readonly Panel[];
  /**
   * Renders a panel's content from its panel, such as a PanelDock.Header above the panel's body.
   * The content mounts once and stays mounted until the panel closes.
   */
  children: (panel: Panel) => ReactNode;
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
   * Called with a panel's new height in rem when a drag on its top edge ends, and on each key
   * press there.
   */
  onHeightChange?: (id: string, height: number) => void;
  /**
   * A width, as a CSS length, such as "40rem", or a number of rem, such as 40: while the dock
   * itself is narrower, one panel at a time fills it and the others wait as tabs. The dock then has
   * data-stacked.
   * @default '40rem'
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
   * @default 'Hidden panels', or EnvUIProvider's messages.panelDock.minimized
   */
  minimizedLabel?: string;
  /**
   * Accessible name of a tab's button that opens its panel, from the tab's text, for this dock
   * only. A function, as each tab names its own panel.
   * @default Show and the text, such as Show Budget, or EnvUIProvider's messages.panelDock.open
   */
  openLabel?: (label: string) => string;
  /**
   * Accessible name of a tab's close button, from the tab's text, for this dock only.
   * @default Close and the text, such as Close Budget, or EnvUIProvider's messages.panelDock.close
   */
  closeLabel?: (label: string) => string;
  /**
   * Accessible name of a panel's resize handle, from its title, for this dock only.
   * @default Resize and the title, such as Resize Quarterly report, or EnvUIProvider's messages.panelDock.resize
   */
  resizeLabel?: (title: string) => string;
}

interface Measurements {
  /** Pixels per rem. */
  rem: number;
  /** The block size open panels have in the dock, in pixels. */
  room: number;
}

/** A panel without a height takes this share of the room, up to defaultHeightRem. */
const defaultHeightShare = 0.85;
const defaultHeightRem = 40;
const minHeightRem = 15;
/**
 * The dock width below which one panel at a time fills it. Not a window class: the dock measures its
 * own width, which a page beside it narrows.
 */
const defaultStackBelow = '40rem';

/**
 * Panels docked to the bottom inline-end edge of a region, beside the page, for items people work
 * on alongside it, such as drafts and conversations: open panels side by side, one maximized panel
 * filling the region, and minimized panels as tabs. A panel's content stays mounted through every
 * change of mode and order.
 */
export function Root<Panel extends PanelDockPanel>({
  panels,
  children,
  onModeChange,
  onClose,
  onActivate,
  onHeightChange,
  stackBelow = defaultStackBelow,
  onStackedChange,
  overflow = 'scroll',
  minimizedLabel,
  openLabel,
  closeLabel,
  resizeLabel,
  className,
  style,
  ref,
  ...props
}: RootProps<Panel>) {
  // Words that fit a minimized panel and one a stacked dock leaves out alike.
  const messages = useMessages('panelDock', panelDockMessages);
  const tabsLabel = minimizedLabel ?? messages.minimized;
  const nameOpen = openLabel ?? ((label: string) => messages.open({ label }));
  const nameClose = closeLabel ?? ((label: string) => messages.close({ label }));
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
  const atRowEnd = useRef(true);
  const previousRow = useRef<readonly string[]>([]);
  const previousTabs = useRef<readonly string[]>([]);
  // Whether the dock stacks, as its container query lays it out; undefined until the dock reads it,
  // as on the server and while hydrating, where CSS alone decides what shows.
  const [measuredStacked, setStacked] = useChangingState<boolean | undefined>(undefined);
  const stacked = measuredStacked ?? false;
  const pending = measuredStacked === undefined;
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
  const { fitRow, returningTime, release } = useDockOverflow<Panel>({
    overflow,
    changeMode,
    refresh,
  });

  // A stacked dock fills the region with one shown panel: the one its tab asked for, else the
  // active one, else the newest; a wide one with its maximized panel. The others wait behind their
  // tabs.
  const activeId = panels.find((panel) => panel.active)?.id;
  const arrange = (asStacked: boolean) => {
    const shown = asStacked
      ? panels.filter((panel) => panel.mode !== 'minimized')
      : panels.filter((panel) => panel.mode === 'maximized');
    const choice = asStacked
      ? heldChoice(tabChoice.current, panels, activeId, recency.current)
      : undefined;
    const fill =
      shown.find((panel) => panel.id === choice) ??
      shown.find((panel) => panel.active) ??
      newest(shown, recency.current);
    const where = new Map<string, Placement>();
    for (const panel of panels)
      where.set(
        panel.id,
        panel === fill ? 'fill' : !asStacked && panel.mode === 'open' ? 'row' : 'hidden',
      );
    return { chosen: choice, filling: fill, placements: where };
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
  /** While the layout is unread, the one layout that has a tab or the strip, if only one does. */
  const tabIn = (wide: boolean, inStacked: boolean) =>
    !stackedLayout || wide === inStacked ? undefined : wide ? 'wide' : 'stacked';
  const rowIds = panels.filter((panel) => placements.get(panel.id) === 'row').map(({ id }) => id);
  const layout = panels.map(({ id }) => `${id}:${placements.get(id)}`).join('\n');
  const hasTabs = tabs.length > 0;
  const hasStrip = shownTabs.length > 0;
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

  function heightOf(panel: Panel): { height?: number; bounds?: HeightBounds } {
    // The panel's sizes are in rem, and the dock works in pixels: until it has measured itself, a
    // rem is the browser's default 16 px.
    const rem = measurements?.rem ?? 16;
    const requested = panel.height === undefined ? chosenHeights.get(panel.id) : panel.height * rem;
    if (!measurements) return { height: requested };
    const { room } = measurements;
    const max = Math.floor(Math.max(0, Math.min((panel.maxHeight ?? Infinity) * rem, room)));
    const min = Math.round(Math.min((panel.minHeight ?? minHeightRem) * rem, max));
    const fallback = Math.min(room * defaultHeightShare, defaultHeightRem * rem);
    return { height: clampRound(requested ?? fallback, min, max), bounds: { min, max, room } };
  }

  function bringForward(id: string) {
    recency.current.set(id, ++clock.current);
  }

  function activate(panel: Panel) {
    if (placements.get(panel.id) === 'hidden') return;
    bringForward(panel.id);
    if (!panel.active) latest.current.onActivate?.(panel.id);
  }

  function restoreFromTab(panel: Panel) {
    pendingRestore.current = panel.id;
    bringForward(panel.id);
    // A stacked dock shows the panel brought forward, even without an active panel.
    if (stacked) tabChoice.current = { id: panel.id, active: activeId, time: clock.current };
    // People brought the panel back: the dock leaves it to them from now on.
    release(panel.id);
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

  function resize(panel: Panel, height: number) {
    if (panel.height === undefined)
      setChosenHeights((current) =>
        current.get(panel.id) === height ? current : new Map(current).set(panel.id, height),
      );
    latest.current.onHeightChange?.(panel.id, roundToHundredth(height / (measurements?.rem ?? 16)));
  }

  function frameOf(id: string) {
    return [...(row.current?.children ?? [])].find(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element.dataset.panelId === id,
    );
  }

  /**
   * Whether the dock is narrower than stackBelow, as laid out now: its container query gives the
   * probe a width where it stacks.
   */
  function stacksNow() {
    return (probe.current?.offsetWidth ?? 0) > 0;
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

  // The dock measures itself: it reads whether its container query stacks it, below stackBelow, and
  // open panels fit its height, as the tabs float over their bottom edge. A rem or em threshold follows the text size.
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
      const room = Math.max(0, element.clientHeight - gutter);
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
    // The probe changes size as the query starts or stops stacking the dock, also where only the
    // text size changes.
    observer.observe(threshold);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRequest);
    };
    // Stacking changes the row's padding above open panels in front of a maximized one, and with it
    // their room, without resizing anything the observer watches.
  }, [stackBelow, filled, stacked, overflow, setStacked, setOverflowing]);

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
      const earlier = returningTime(panel.id);
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
  }, [panels, chosenHeights, returningTime]);

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
    fitRow(rowElement, {
      panels,
      rowIds,
      placements,
      recency: recency.current,
      stacks: () => stacked || stacksNow(),
      frameOf,
      focusedId: () => {
        const focus = locateFocus(root.current, focusedPanel.current);
        return focus && !focus.tab ? focus.id : undefined;
      },
    });
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

  useStripWheel(strip, hasStrip);

  return (
    <Column
      justify="end"
      {...props}
      ref={(node) => {
        root.current = node;
        setRef(ref, node);
      }}
      className={classNames('env-panel-dock', className)}
      style={{ ...style, '--env-panel-dock-stack-below': remLength(stackBelow) } as CSSProperties}
      data-stacked={flag(stacked)}
      data-filled={flag(filled)}
      data-tabs={flag(hasTabs)}
      data-env-ssr-pending={pending || undefined}
      data-env-ssr-filled={stackedLayout?.filling !== undefined || undefined}
      data-env-ssr-tabs={(stackedLayout && stackedTabs.length > 0) || undefined}
    >
      <Row
        align="end"
        ref={row}
        className="env-panel-dock-row"
        data-overflowing={flag(overflowing)}
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
              stackedPlacement={stackedLayout?.placements.get(panel.id)}
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
      </Row>
      {hasStrip && (
        <Row
          align="end"
          render={
            <ul
              ref={strip}
              className="env-panel-dock-strip"
              aria-label={tabsLabel}
              data-env-ssr-tab-in={tabIn(hasTabs, stackedTabs.length > 0)}
            />
          }
        >
          {shownTabs.map((panel) => (
            <PanelTab
              key={panel.id}
              panel={panel}
              tabIn={tabIn(tabs.includes(panel), stackedTabs.includes(panel))}
              openLabel={nameOpen}
              closeLabel={nameClose}
              onRestore={() => restoreFromTab(panel)}
              onClose={() => close(panel.id)}
            />
          ))}
        </Row>
      )}
      <div ref={probe} className="env-panel-dock-probe" aria-hidden="true" />
    </Column>
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
