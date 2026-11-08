'use client';

import {
  createElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { classNames } from '../../internal/classNames.js';
import { IconButton } from '../../actions/Button.js';
import { Tooltip } from '../../overlays/Tooltip.js';
import { IconCloseFullscreen } from '../../icons/CloseFullscreen.js';
import { IconMinimize } from '../../icons/Minimize.js';
import { IconClose } from '../../icons/Close.js';
import { IconOpenInFull } from '../../icons/OpenInFull.js';
import { Column, Grid, Row } from '../Layout.js';
import { ControlDefaults } from '../../internal/control/ControlDefaults.js';
import { remLength } from '../../internal/dom/lengths.js';
import { setRef } from '../../internal/setRef.js';
import { useLatest } from '../../internal/useLatest.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { useStackedReport } from '../../internal/useStackedReport.js';
import { panelDock as panelDockMessages } from '../../foundations/messages/panelDock.js';
import type { HeadingLevel } from '../../foundations/headingLevel.js';
import type { PanelDockMode, PanelDockPanel } from './panelDockTypes.js';
import { PanelDockPanelContext } from './internal/PanelDockPanelContext.js';
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
import { useStripWheel } from '../../internal/useStripWheel.js';
import { withDisplayName } from '../../internal/withDisplayName.js';
import { flag } from '../../internal/flag.js';
import '../../styles/Base.css';
import '../../styles/PanelDock.css';

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
function Root<Panel extends PanelDockPanel>({
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
      style={{ ...style, '--env-panel-dock-stack-below': remLength(stackBelow) }}
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

export interface HeaderProps extends Omit<ComponentPropsWithRef<'header'>, 'title'> {
  /**
   * The panel's title, as a heading in 1.125 rem medium-weight text; it wraps between words rather
   * than truncating.
   */
  title: ReactNode;
  /** Supporting text below the title, in 0.875 rem muted text, such as who changed it last. */
  meta?: ReactNode;
  /**
   * The application's own actions, before the window controls, such as an Edit IconButton and a
   * Menu of more; buttons that set no variant take the window controls' ghost one.
   */
  actions?: ReactNode;
  /**
   * Shows the window controls, Minimize, Maximize or Restore, and Close, inside a PanelDock; false
   * leaves them out. EnvUIProvider's messages.panelDock names them.
   * @default true
   */
  controls?: boolean;
  /**
   * The title's heading level in the page outline; the look stays the same.
   * @default 2
   */
  headingLevel?: HeadingLevel;
  /** Content below the title row that stays with the sticky header, such as Tabs. */
  children?: ReactNode;
}

/**
 * The header of a docked panel. It sticks to the top of the panel while its content scrolls: the
 * title and its metadata at the start, the application's actions and the window controls at the
 * end, small like a title bar's.
 */
function Header({
  title,
  meta,
  actions,
  controls = true,
  headingLevel = 2,
  className,
  children,
  ref,
  ...props
}: HeaderProps) {
  const panel = useContext(PanelDockPanelContext);
  const header = useRef<HTMLElement>(null);
  const windowControls = controls && panel !== null;
  // The panel's content keeps controls that take focus out from beneath the header, so it needs
  // the header's size, which changes as the title wraps.
  const reportSize = panel?.reportHeaderSize;
  useLayoutEffect(() => {
    const element = header.current;
    if (!element || !reportSize) return;
    const measure = () => reportSize(element.offsetHeight);
    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(element);
    return () => {
      observer?.disconnect();
      reportSize(0);
    };
  }, [reportSize]);
  return (
    <header
      {...props}
      ref={(node) => {
        header.current = node;
        setRef(ref, node);
      }}
      className={classNames('env-panel-dock-header', className)}
      // Also where the header sits deeper in the content, such as in a form.
      data-scrolled={flag(panel?.scrolled)}
    >
      <Grid className="env-panel-dock-heading">
        {createElement(`h${headingLevel}`, { className: 'env-panel-dock-title' }, title)}
        {meta != null && <div className="env-panel-dock-meta">{meta}</div>}
      </Grid>
      {(actions != null || windowControls) && (
        <Row align="center" className="env-panel-dock-actions">
          {/* The application's buttons take the window controls' quiet look. */}
          <ControlDefaults variant="ghost">{actions}</ControlDefaults>
          {windowControls && <WindowControls />}
        </Row>
      )}
      {children != null && <div className="env-panel-dock-header-content">{children}</div>}
    </header>
  );
}

/**
 * Minimize, Maximize or Restore, and Close for the panel around them, as small icon buttons with
 * tooltips, named from EnvUIProvider's messages. A stacked dock already fills the region, so its
 * panels leave out Maximize.
 */
function WindowControls() {
  const panel = useContext(PanelDockPanelContext)!;
  const messages = useMessages('panelDock', panelDockMessages);
  const maximized = panel.mode === 'maximized';
  return (
    <Row align="center" className="env-panel-dock-controls">
      <WindowControl
        label={messages.minimize}
        icon={<IconMinimize />}
        onClick={() => panel.changeMode('minimized')}
      />
      {!panel.stacked && (
        <WindowControl
          control="maximize"
          label={maximized ? messages.restore : messages.maximize}
          icon={maximized ? <IconCloseFullscreen /> : <IconOpenInFull />}
          onClick={() => panel.changeMode(maximized ? 'open' : 'maximized')}
        />
      )}
      <Tooltip content={messages.closeWindow}>
        <IconButton
          variant="ghost"
          icon={<IconClose />}
          aria-label={messages.closeWindow}
          onClick={panel.close}
        />
      </Tooltip>
    </Row>
  );
}

function WindowControl({
  control,
  label,
  icon,
  onClick,
}: {
  /** Names the control for the dock's styles, as data-window-control. */
  control?: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <Tooltip content={label}>
      <IconButton
        variant="ghost"
        icon={icon}
        aria-label={label}
        data-window-control={control}
        onClick={onClick}
      />
    </Tooltip>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'PanelDock.Root');
const HeaderPart = /* @__PURE__ */ withDisplayName(Header, 'PanelDock.Header');
export { RootPart as Root, HeaderPart as Header };
