'use client';

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { classNames } from '../../internal/classNames.js';
import { Column, Row } from '../../foundations/Layout.js';
import { remLength } from '../../internal/cssLength.js';
import { setRef } from '../../internal/setRef.js';
import { useLatest } from '../../internal/useLatest.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { useStackedReport } from '../../internal/useStackedReport.js';
import { panelDock as panelDockMessages } from '../../foundations/messages/panelDock.js';
import type { PanelDockMode } from './internal/PanelDockPanelContext.js';
import { overflows, reveal } from './internal/dockLayout.js';
import { PanelFrame } from './internal/PanelFrame.js';
import { PanelTab } from './internal/PanelTab.js';
import { useDockArrangement } from './internal/useDockArrangement.js';
import { useDockFocus, useFocusTracking } from './internal/useDockFocus.js';
import { useDockMeasurements } from './internal/useDockMeasurements.js';
import { useDockOverflow } from './internal/useDockOverflow.js';
import { usePanelHeights } from './internal/usePanelHeights.js';
import { useRecency } from './internal/useRecency.js';
import { useScrollPreservation } from './internal/useScrollPreservation.js';
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
  const [, refresh] = useReducer((count: number) => count + 1, 0);
  const latest = useLatest({ onModeChange, onClose, onActivate, onHeightChange });
  const changeMode = useCallback(
    (id: string, mode: PanelDockMode) => latest.current.onModeChange(id, mode),
    [latest],
  );
  const close = useCallback((id: string) => latest.current.onClose(id), [latest]);
  const { fitRow, returningTime, release } = useDockOverflow<Panel>({
    overflow,
    changeMode,
    refresh,
  });
  const recency = useRecency(panels, returningTime);
  const { stacked, pending, measurements, overflowing, setOverflowing, stacksNow, onRowScroll } =
    useDockMeasurements({ root, row, probe, panels, stackBelow, overflow, refresh });
  const arrangement = useDockArrangement({ panels, stacked, pending, recency });
  const { filling, placements, tabs, stackedTabs, shownTabs, rowIds, tabIn } = arrangement;
  const hasTabs = tabs.length > 0;
  const hasStrip = shownTabs.length > 0;
  const filled = filling !== undefined;
  const focus = useFocusTracking(root);
  const restoreScrollPositions = useScrollPreservation(row, arrangement.layout);
  const { heightOf, resize } = usePanelHeights(panels, measurements, (id, height) =>
    latest.current.onHeightChange?.(id, height),
  );

  // Content is rendered by the application; internal updates, such as a resize, reuse the same
  // elements, so they do not render the panels' content again.
  const contents = useMemo(
    () => new Map(panels.map((panel) => [panel.id, children(panel)] as const)),
    [panels, children],
  );

  function activate(panel: Panel) {
    if (placements.get(panel.id) === 'hidden') return;
    recency.bringForward(panel.id);
    if (!panel.active) latest.current.onActivate?.(panel.id);
  }

  function restoreFromTab(panel: Panel) {
    focus.focusOnShow(panel.id);
    recency.bringForward(panel.id);
    // A stacked dock shows the panel brought forward, even without an active panel.
    if (stacked) arrangement.chooseTab(panel.id);
    // People brought the panel back: the dock leaves it to them from now on.
    release(panel.id);
    if (panel.mode === 'minimized') latest.current.onModeChange(panel.id, 'open');
    if (!panel.active) latest.current.onActivate?.(panel.id);
    refresh();
  }

  function frameOf(id: string) {
    return [...(row.current?.children ?? [])].find(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element.dataset.panelId === id,
    );
  }

  useStackedReport(stacked, onStackedChange);

  // A panel that joins the row scrolls into view, so the newest shows while the row overflows.
  const previousRow = useRef<readonly string[]>([]);
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
      recency: recency.times,
      stacks: () => stacked || stacksNow(),
      frameOf,
      focusedId: focus.focusedId,
    });
  });

  useDockFocus(focus, { panels, placements, tabs, filling, frameOf, strip });
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
      data-env-ssr-filled={arrangement.stackedFilled || undefined}
      data-env-ssr-tabs={(arrangement.stackedPlacements && stackedTabs.length > 0) || undefined}
    >
      <Row
        align="end"
        ref={row}
        className="env-panel-dock-row"
        data-overflowing={flag(overflowing)}
        onScroll={(event) => onRowScroll(event.currentTarget)}
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
              stackedPlacement={arrangement.stackedPlacements?.get(panel.id)}
              stacked={stacked}
              height={height}
              bounds={placement === 'row' ? bounds : undefined}
              content={contents.get(panel.id)}
              resizeLabel={nameResize(panel.title)}
              changeMode={changeMode}
              close={close}
              onActivate={() => activate(panel)}
              onFocusWithin={(element) => focus.onFocusWithin(panel.id, element)}
              onFocusContent={(target) => focus.onFocusContent(panel.id, target)}
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
 * Renders nothing. As the first child of the row, its layout effect runs before those of the
 * panels' content, which React runs in the order of the tree.
 */
function BeforeContent({ onLayout }: { onLayout: () => void }) {
  useLayoutEffect(onLayout);
  return null;
}
