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
  /** Called with the mode a panel asks for, from its window controls and its chip. */
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
   * recently active open panel, one at a time, until the rest fit. It never asks for the active
   * panel or the newest one, so never for a panel alone in the row, and where those cannot fit by
   * themselves the row scrolls instead.
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
  restoreLabel?: (label: string) => string;
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
const defaultRestoreLabel = (label: string) => `Show ${label}`;
const defaultCloseLabel = (label: string) => `Close ${label}`;
const defaultResizeLabel = (title: string) => `Resize ${title}`;

/** A panel without a height takes this share of the room, up to defaultHeightRem. */
const defaultHeightShare = 0.85;
const defaultHeightRem = 40;
const minHeightRem = 15;
const resizeStep = 16;
const resizeLargeStep = 64;

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
  restoreLabel = defaultRestoreLabel,
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
  // Whether the dock stacks by its latest measurement, which the next render follows.
  const measuredStacked = useRef(false);
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
  // Panels the dock asked to minimize to make room, until they leave the row.
  const makingRoom = useRef(new Set<string>());
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
   * With overflow="minimize", open panels that cannot all fit at their minimum widths make room:
   * the dock asks to minimize the least recently active one, never the active panel or the newest,
   * and only where that lets the rest fit. It then waits for that panel to leave the row before it
   * asks again, so a panel the application keeps open is asked once.
   */
  function makeRoom(rowElement: HTMLElement) {
    for (const id of makingRoom.current) if (!rowIds.includes(id)) makingRoom.current.delete(id);
    if (overflow !== 'minimize' || makingRoom.current.size > 0) return;
    // A dock that stacks, or is about to as it first shows or narrows, has no row to make room in.
    if (stacked || measuredStacked.current) return;
    const inRow = panels.filter((panel) => placements.get(panel.id) === 'row');
    const room = rowRoom(rowElement);
    const fit = (list: readonly T[]) => fitsInRow(room, list.map(frameOfPanel));
    if (!overflows(rowElement) || fit(inRow)) return;
    // The panel people work in stays, and so does the newest, such as one just brought back from
    // its chip, also alone in the row. Where those cannot fit by themselves, minimizing the others
    // would only hide them, and the row scrolls.
    const newestInRow = newest(inRow, recency.current);
    const stays = (panel: T) => panel.active || panel === newestInRow;
    if (!fit(inRow.filter(stays))) return;
    const others = inRow.filter((panel) => !stays(panel));
    const leaving = oldest(others, recency.current);
    if (!leaving) return;
    makingRoom.current.add(leaving.id);
    latest.current.onModeChange(leaving.id, 'minimized');
  }
  // The dock measures itself outside its renders, with this render's panels.
  const makeRoomLatest = useRef(makeRoom);
  useLayoutEffect(() => {
    makeRoomLatest.current = makeRoom;
  });

  function restoreFromChip(panel: T) {
    pendingRestore.current = panel.id;
    bringForward(panel.id);
    // A stacked dock shows the panel brought forward, even without an active panel.
    if (stacked) chipChoice.current = { id: panel.id, active: activeId, time: clock.current };
    if (panel.mode === 'minimized') latest.current.onModeChange(panel.id, 'open');
    if (!panel.active) latest.current.onActivate?.(panel.id);
    refresh();
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

  function frameOfPanel(panel: T) {
    return frameOf(panel.id);
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
        revealInContent(frame, last);
        return;
      }
    }
    frame.focus({ preventScroll: true });
  }

  /** Once the focused panel or chip leaves: the active or newest panel shown, or the last chip. */
  function focusRemaining() {
    const visible = panels.filter((panel) => placements.get(panel.id) !== 'hidden');
    const target =
      visible.find((panel) => panel.active) ??
      visible.filter((panel) => placements.get(panel.id) === 'row').at(-1) ??
      filling;
    if (target) focusInto(target.id);
    else chipButtonOf(chips.at(-1)?.id)?.focus();
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
      const stackedNow = element.offsetWidth < threshold.offsetWidth;
      measuredStacked.current = stackedNow;
      setStacked(stackedNow);
      const fontSize = view?.getComputedStyle(element.ownerDocument.documentElement).fontSize;
      const rem = parseFloat(fontSize ?? '') || 16;
      const gutter = parseFloat(view?.getComputedStyle(rowElement).paddingBlockStart ?? '') || 0;
      const chipsSize = strip.current?.offsetHeight ?? 0;
      const room = Math.max(0, element.clientHeight - chipsSize - gutter);
      setMeasurements((current) =>
        current?.rem === rem && current.room === room ? current : { rem, room },
      );
      setOverflowing(overflows(rowElement));
      makeRoomLatest.current(rowElement);
      if (atRowEnd.current) scrollToRowEnd(rowElement);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(threshold);
    if (strip.current) observer.observe(strip.current);
    return () => observer.disconnect();
    // Stacking changes the row's padding above open panels in front of a maximized one, and with it
    // their room, without resizing anything the observer watches.
  }, [stackBelow, hasChips, filled, stacked]);

  useStackedReport(stacked, onStackedChange);

  // Shown panels keep the time they appeared; minimized and closed ones are forgotten, so a panel
  // brought back is the newest again.
  useLayoutEffect(() => {
    const shownIds = new Set<string>();
    for (const panel of panels) {
      if (panel.mode === 'minimized') continue;
      shownIds.add(panel.id);
      if (!recency.current.has(panel.id)) bringForward(panel.id);
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
  // such as the panel that was active when it was made.
  useLayoutEffect(() => {
    if (chosen === undefined) chipChoice.current = null;
  });

  // A panel that moves or changes where it shows keeps its scroll positions, which the browser
  // resets to the start as it lays the boxes out afresh. Content that scrolled itself in the same
  // update, such as a chat showing a new message, keeps the position it chose.
  useLayoutEffect(() => {
    if (previousLayout.current === layout) return;
    previousLayout.current = layout;
    const positions = scrollsBefore.current;
    scrollsBefore.current = [];
    for (const { element, top, left } of positions) {
      if (!element.isConnected) continue;
      if (element.scrollTop === 0 && top !== 0) element.scrollTop = top;
      if (element.scrollLeft === 0 && left !== 0) element.scrollLeft = left;
    }
  }, [layout]);

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
    makeRoom(rowElement);
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
        if (next) chipButtonOf(next.id)?.focus();
        else focusRemaining();
      } else if (isShown(placement)) focusInto(focusBefore.id);
      return;
    }
    if (placement === undefined) {
      if (lost) focusRemaining();
    } else if (placement === 'hidden') {
      // Focus in a popup the panel opened, such as a menu in a portal, moves to the chip too.
      if (lost || focusBefore.popup || frameOf(focusBefore.id)?.contains(focused))
        chipButtonOf(focusBefore.id)?.focus();
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
              restoreLabel={restoreLabel}
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
  // Whether the content has scrolled from its top, where a hairline then marks the header.
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
    }),
    [id, mode, stacked, changeMode, close],
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
        data-scrolled={scrolled || undefined}
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
  restoreLabel: (label: string) => string;
  closeLabel: (label: string) => string;
  onRestore: () => void;
  onClose: () => void;
}

/** A panel out of sight: a button that brings it back and a close button. */
function PanelChip({ panel, restoreLabel, closeLabel, onRestore, onClose }: PanelChipProps) {
  const descriptionId = useId();
  const chip = useRef<HTMLLIElement>(null);
  useEntrance(chip, 'chip', true);
  const label = panel.label ?? panel.title;
  const attention = Boolean(panel.attention);
  const restore = (
    <button
      type="button"
      className="env-panel-dock-chip-restore"
      aria-label={restoreLabel(label)}
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
 * The panel a chip asked a stacked dock to show, while that choice holds: while the panel is there,
 * the same panel is active, and no other panel has appeared or been brought forward since. A panel
 * not recorded yet has just appeared.
 */
function heldChoice(
  choice: ChipChoice | null,
  panels: readonly PanelDockPanel[],
  activeId: string | undefined,
  times: Map<string, number>,
) {
  if (!choice || choice.active !== activeId) return undefined;
  let present = false;
  for (const panel of panels) {
    if (panel.id === choice.id) present = true;
    else if (panel.mode !== 'minimized' && (times.get(panel.id) ?? Infinity) > choice.time)
      return undefined;
  }
  return present ? choice.id : undefined;
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
 * Scrolls an element that a panel's content hides entirely, also beneath its sticky header, into
 * view; one that partly shows keeps the scroll positions people left.
 */
function revealInContent(frame: HTMLElement, element: HTMLElement) {
  const content = frame.querySelector(':scope > .env-panel-dock-content');
  if (!content) return;
  const area = content.getBoundingClientRect();
  const start = area.top + (parseFloat(getComputedStyle(content).scrollPaddingTop) || 0);
  const target = element.getBoundingClientRect();
  if (target.bottom > start && target.top < area.bottom) return;
  element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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

/** Whether panels fit side by side in the row at their minimum widths. */
function fitsInRow(
  room: { size: number; gap: number },
  frames: readonly (HTMLElement | undefined)[],
) {
  let total = -room.gap;
  for (const frame of frames) if (frame) total += minimumWidth(frame) + room.gap;
  return total <= room.size + 1;
}

/** The narrowest a panel gets in the row, with its borders and margins. */
function minimumWidth(frame: HTMLElement) {
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
