'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { DockToRight } from '../icons/DockToRight.js';
import { Skeleton } from '../feedback/Skeleton.js';
import { LoadingState } from '../feedback/LoadingState.js';
import { LoadingBar } from '../feedback/internal/LoadingBar.js';
import { useScrollKeys } from './internal/useScrollKeys.js';
import { InSidebarContext, SidebarCompactContext } from './internal/SidebarCompact.js';

/** Viewports where the sidebar becomes an overlay opened from the topbar. */
const narrowQuery = '(max-width: 40rem), (max-height: 32rem) and (max-width: 54rem)';
/** Hover expansion needs a precise pointer; touch input toggles instead. */
const hoverQuery = '(hover: hover) and (pointer: fine)';

interface AppShellContextValue {
  /** Close the overlay sidebar on narrow viewports; no effect elsewhere. */
  closeNarrowSidebar: () => void;
  /**
   * The element that scrolls the page content: the content area in a title-bar shell, else the
   * scrolling element of the shell's document. Read or restore scroll positions on it. In a
   * title-bar shell it is null until the content area is attached. The function changes once the
   * shell is attached, so effects that depend on it run again: with the content area of a title-bar
   * shell, and with the frame's scrolling element where the shell is rendered into a frame. Every
   * copy of the function returns the current element, including one kept from an earlier render.
   */
  getScrollElement: () => HTMLElement | null;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

/** Shell controls for content rendered inside AppShell. */
export function useAppShell() {
  const value = useContext(AppShellContext);
  if (!value) throw new Error('useAppShell must be used inside AppShell.');
  return value;
}

function readMedia(query: string) {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches);
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => readMedia(query));
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function readStored(key: string | undefined) {
  if (!key || typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string | undefined, value: string) {
  if (!key) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The shell still works when browser storage is unavailable.
  }
}

function readStoredCollapsed(storageKey: string | undefined, fallback: boolean) {
  const stored = readStored(storageKey);
  return stored === null ? fallback : stored === 'true';
}

/** The measured sidebar content width is kept beside the collapsed preference. */
function widthKey(storageKey: string | undefined) {
  return storageKey && `${storageKey}-width`;
}

/** A width chosen by resizing has its own key, so a later measurement never replaces it. */
function chosenWidthKey(storageKey: string | undefined) {
  return storageKey && `${storageKey}-chosen-width`;
}

function readStoredWidth(key: string | undefined) {
  const width = Number(readStored(key));
  return Number.isFinite(width) && width > 0 ? width : undefined;
}

/** The width a shell starts at: a resizable one's chosen width, else the measured width. */
function readStartWidth(storageKey: string | undefined, resizable: boolean) {
  const chosen = resizable ? readStoredWidth(chosenWidthKey(storageKey)) : undefined;
  return { chosen, measured: readStoredWidth(widthKey(storageKey)) };
}

/** Without a stored or chosen width, a resizable sidebar starts at the measured width, up to 20 rem. */
const measuredMaxRem = 20;
const resizeStep = 16;
const resizeLargeStep = 48;

interface WidthBounds {
  min: number;
  max: number;
}

function sidebarWidthStyle(width: number | undefined, bounds?: WidthBounds) {
  const style: Record<string, string> = {};
  if (width !== undefined) style['--env-sidebar-content-width'] = `${width}px`;
  if (bounds) {
    style['--env-sidebar-min-width'] = `${bounds.min}px`;
    style['--env-sidebar-max-width'] = `${bounds.max}px`;
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}

function clampWidth(width: number, bounds: WidthBounds) {
  return Math.round(Math.min(bounds.max, Math.max(bounds.min, width)));
}

/** Pixels per rem, read after mount so server-rendered markup and the first render agree. */
function useRemPixels() {
  const [pixels, setPixels] = useState(16);
  useLayoutEffect(() => {
    const size = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (Number.isFinite(size) && size > 0) setPixels(size);
  }, []);
  return pixels;
}

/** Resize bounds in pixels: 12 rem and 32 rem unless the application supplies its own. */
function useWidthBounds(minWidth: number | undefined, maxWidth: number | undefined) {
  const rem = useRemPixels();
  const min = minWidth ?? 12 * rem;
  return { bounds: { min, max: Math.max(min, maxWidth ?? 32 * rem) }, rem };
}

interface AppShellFrameProps {
  /** Brand mark in the sidebar toggle; the toggle icon replaces it while the sidebar region is hovered. */
  brand: ReactNode;
  /**
   * Content in the topbar beside the toggle, such as an organization switcher. In the split topbar
   * it sits above the sidebar and hides while the sidebar is compact.
   */
  context?: ReactNode;
  /** Current page name in the topbar. Hidden on narrow viewports. */
  title?: ReactNode;
  /** Topbar actions at the end, such as a ThemeToggle and an account Menu. */
  actions?: ReactNode;
  /** Separator lines between the topbar, sidebar and content (default). */
  dividers?: boolean;
  /**
   * split (default): the context sits above the sidebar, as wide as the sidebar, beside the page
   * part. full: one row across the window, independent of the sidebar: the toggle, the context at
   * its natural width, the title, and the actions at the end.
   */
  topbar?: 'split' | 'full';
  /**
   * The topbar is the window's title bar, for installed web apps and desktop shells that draw their
   * own title bar (the Window Controls Overlay): empty space drags the window, it leaves room for the
   * window controls the system draws, and the controls inside are compact. The shell then fills the
   * window and its content area scrolls below the title bar instead of the document; the keyboard
   * scrolls it as it would the document. Meant for the full topbar.
   */
  titleBar?: boolean;
  /** Classes for the shell's root. */
  className?: string;
}

export interface AppShellProps extends AppShellFrameProps {
  /** NavList.Item elements for the sidebar. */
  navigation: ReactNode;
  /** Accessible name of the sidebar navigation. */
  navigationLabel: string;
  /** Page content. */
  children: ReactNode;
  /** Shows a loading bar along the bottom of the topbar, for example while the next page loads. */
  loading?: boolean;
  /** Accessible name of the loading bar. */
  loadingLabel?: string;
  /** Persist the collapsed preference under this localStorage key. */
  storageKey?: string;
  /** Whether an uncontrolled sidebar starts collapsed on wide viewports; expanded by default. */
  defaultCollapsed?: boolean;
  /** Controlled collapsed preference on wide viewports. */
  collapsed?: boolean;
  /** Called with the new preference when the toggle collapses or expands the sidebar. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Accessible name of the toggle while the sidebar is collapsed; Expand sidebar by default. */
  expandLabel?: string;
  /** Accessible name of the toggle while the sidebar is expanded; Collapse sidebar by default. */
  collapseLabel?: string;
  /**
   * Content below the navigation, such as a Tree. It fills the remaining sidebar height and scrolls
   * itself; hidden while the sidebar shows icons only.
   */
  sidebarContent?: ReactNode;
  /** Let people adjust the expanded sidebar width by dragging its edge or with the arrow keys. */
  resizable?: boolean;
  /** Controlled expanded width in pixels while resizable. */
  sidebarWidth?: number;
  /** Called with the new width in pixels while the sidebar is resized. */
  onSidebarWidthChange?: (width: number) => void;
  /** Smallest resizable width in pixels; 12 rem by default. */
  sidebarMinWidth?: number;
  /** Largest resizable width in pixels; 32 rem by default. */
  sidebarMaxWidth?: number;
  /** Accessible name of the resize handle. */
  resizeLabel?: string;
}

/**
 * Application frame with a topbar and a collapsible navigation sidebar. Collapsed sidebars expand
 * while hovered or focused, the brand mark turns into the toggle on hover, and narrow viewports
 * open the sidebar as an overlay that closes after navigation.
 */
export function AppShell({
  brand,
  context,
  title,
  actions,
  dividers = true,
  topbar = 'split',
  titleBar = false,
  className,
  navigation,
  navigationLabel,
  children,
  loading = false,
  loadingLabel = 'Loading page',
  storageKey,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  expandLabel = 'Expand sidebar',
  collapseLabel = 'Collapse sidebar',
  sidebarContent,
  resizable = false,
  sidebarWidth: controlledWidth,
  onSidebarWidthChange,
  sidebarMinWidth,
  sidebarMaxWidth,
  resizeLabel = 'Resize sidebar',
}: AppShellProps) {
  const isNarrow = useMedia(narrowQuery);
  const canHover = useMedia(hoverQuery);
  // A full topbar does not depend on the sidebar: the context keeps its width and stays visible.
  const full = topbar === 'full';
  const [storedCollapsed, setStoredCollapsed] = useState(() =>
    readStoredCollapsed(storageKey, defaultCollapsed),
  );
  const collapsed = controlledCollapsed ?? storedCollapsed;
  const [narrowOpen, setNarrowOpen] = useState(false);
  const [regionHovered, setRegionHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  // After collapsing with the pointer over the sidebar, it stays compact until the pointer leaves.
  const [hoverSuppressed, setHoverSuppressed] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const contextRegion = useRef<HTMLDivElement>(null);
  const sidebarRegion = useRef<HTMLElement>(null);
  const sidebarContentRegion = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const navigationRegion = useRef<HTMLElement>(null);
  const content = useRef<HTMLElement>(null);
  // Also kept in state, as is the shell, so getScrollElement changes once they are attached; refs
  // attach only after the content's own layout effects run.
  const [contentElement, setContentElement] = useState<HTMLElement | null>(null);
  const [shellElement, setShellElement] = useState<HTMLDivElement | null>(null);
  const [contentWidth, setContentWidth] = useState<number>();
  const measuredWidth = useRef<number>(undefined);
  // Transitions start after the first paint, so the measured width never animates in on load.
  const [ready, setReady] = useState(false);
  const { bounds, rem } = useWidthBounds(sidebarMinWidth, sidebarMaxWidth);
  // A width chosen by resizing replaces the measured width; until then the measured width applies.
  const [chosenWidth, setChosenWidth] = useState<number>();
  const [resizing, setResizing] = useState(false);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
    /** The chosen width before the drag; undefined while the measured width applied. */
    startChosen: number | undefined;
    direction: number;
  }>(null);
  const widthChosen = resizable && (controlledWidth !== undefined || chosenWidth !== undefined);
  const widthChosenRef = useRef(widthChosen);
  widthChosenRef.current = widthChosen;
  const resizableWidth = clampWidth(
    controlledWidth ?? chosenWidth ?? Math.min(contentWidth ?? bounds.min, measuredMaxRem * rem),
    bounds,
  );

  const hoverExpanded =
    collapsed &&
    !isNarrow &&
    !hoverSuppressed &&
    ((canHover && regionHovered) || focusWithin || popupOpen);
  const compact = !isNarrow && collapsed && !hoverExpanded;

  // Collapsing, by the toggle, an application shortcut or the collapsed prop, compacts the sidebar
  // even while it holds focus or the pointer: focus already there does not hold it open, though
  // focus moving within it afterwards does, and the pointer expands it again once it has left.
  // Content the compact sidebar hides lets go of focus.
  const wasCollapsed = useRef(collapsed);
  useLayoutEffect(() => {
    const collapsing = collapsed && !wasCollapsed.current;
    wasCollapsed.current = collapsed;
    if (!collapsing || isNarrow) return;
    setFocusWithin(false);
    if (regionHovered) setHoverSuppressed(true);
    const focused = sidebarContentRegion.current?.ownerDocument.activeElement;
    if (focused instanceof HTMLElement && sidebarContentRegion.current?.contains(focused))
      focused.blur();
  }, [collapsed, isNarrow, regionHovered]);
  const sidebarVisible = !isNarrow || narrowOpen;
  const measurable = !compact && sidebarVisible;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // The stored widths apply after mount, so server-rendered markup and the first client render
  // agree; they still arrive before the first paint.
  useLayoutEffect(() => {
    const { chosen, measured } = readStartWidth(storageKey, resizable);
    if (chosen !== undefined) setChosenWidth((current) => current ?? chosen);
    if (measured !== undefined) setContentWidth((current) => current ?? measured);
  }, [storageKey, resizable]);

  // The expanded sidebar fits its widest content: the navigation or, in the split topbar, the
  // context beside the toggle; in the full topbar, the navigation or the sidebar content. They are
  // measured at their natural width, which only shows while labels are visible.
  const measureSidebar = useCallback(() => {
    const frame = shell.current;
    const navigation = navigationRegion.current;
    const companion = full ? sidebarContentRegion.current : contextRegion.current;
    // Compact and hidden sidebars show no labels to measure; the last width stays. A width chosen
    // by resizing stays as it is.
    if (!frame || !navigation || (!full && !companion) || widthChosenRef.current) return;
    if (frame.hasAttribute('data-compact') || sidebarRegion.current?.hidden) return;
    frame.setAttribute('data-measuring', '');
    const width = Math.ceil(
      Math.max(
        navigation.getBoundingClientRect().width,
        companion?.getBoundingClientRect().width ?? 0,
      ),
    );
    frame.removeAttribute('data-measuring');
    // A shell inside a hidden ancestor measures nothing; unchanged widths need no update.
    if (width === 0 || width === measuredWidth.current) return;
    measuredWidth.current = width;
    setContentWidth(width);
    writeStored(widthKey(storageKey), String(width));
  }, [storageKey, full]);

  useLayoutEffect(() => {
    if (measurable) measureSidebar();
  }, [measurable, measureSidebar]);

  useEffect(() => {
    const regions = [navigationRegion.current, full ? null : contextRegion.current].filter(
      (region): region is HTMLElement => region !== null,
    );
    const observer = new MutationObserver(measureSidebar);
    for (const region of regions) {
      observer.observe(region, { subtree: true, childList: true, characterData: true });
      // Images, such as an organization logo, change the width when they load.
      region.addEventListener('load', measureSidebar, true);
    }
    // Sidebar content, such as a virtualized tree, changes as it scrolls; only replacing it counts.
    if (full && sidebarContentRegion.current)
      observer.observe(sidebarContentRegion.current, { childList: true });
    document.fonts?.addEventListener('loadingdone', measureSidebar);
    return () => {
      observer.disconnect();
      for (const region of regions) region.removeEventListener('load', measureSidebar, true);
      document.fonts?.removeEventListener('loadingdone', measureSidebar);
    };
  }, [measureSidebar, full]);

  useEffect(() => setNarrowOpen(false), [isNarrow]);

  // A popup opened from the sidebar region (its trigger has aria-expanded) keeps the sidebar expanded.
  // The context of a full topbar is not part of that region.
  useEffect(() => {
    const regions = [full ? null : contextRegion.current, sidebarRegion.current].filter(
      (region): region is HTMLElement => region !== null,
    );
    // Expanded tree rows are not popups; an open context menu is.
    const update = () =>
      setPopupOpen(
        regions.some((region) =>
          region.querySelector(
            '[aria-expanded="true"]:not(.env-app-sidebar-toggle):not([role="treeitem"]), [data-popup-open]',
          ),
        ),
      );
    const observer = new MutationObserver(update);
    for (const region of regions)
      observer.observe(region, {
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-expanded', 'data-popup-open'],
      });
    update();
    return () => observer.disconnect();
  }, [full]);

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (controlledCollapsed === undefined) setStoredCollapsed(next);
      onCollapsedChange?.(next);
      writeStored(storageKey, String(next));
    },
    [controlledCollapsed, onCollapsedChange, storageKey],
  );

  function toggleSidebar() {
    if (isNarrow) {
      setNarrowOpen((open) => !open);
      return;
    }
    setHoverSuppressed(!collapsed);
    setCollapsed(!collapsed);
  }

  const closeNarrowSidebar = useCallback(() => setNarrowOpen(false), []);
  // A title-bar shell scrolls its content area below the title bar; otherwise the document scrolls.
  const scrollingContent = titleBar ? contentElement : null;
  // The function reads the elements as it is called, so a copy kept from an earlier render returns
  // them too. It still changes once the shell and its content area are attached, so effects that
  // depend on it run again: with the content area, or inside a frame with the frame's scroller.
  const getScrollElement = useCallback((): HTMLElement | null => {
    if (titleBar) return content.current;
    // Until the shell is attached, as the content's first layout effects run, the global document
    // stands in for the shell's own.
    const page =
      shell.current?.ownerDocument ?? (typeof document === 'undefined' ? null : document);
    if (!page) return null;
    return (page.scrollingElement as HTMLElement | null) ?? page.documentElement;
    // The elements are listed on purpose, so that the function changes as they attach (above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleBar, scrollingContent, shellElement]);
  // With the document no longer scrolling, the keyboard scrolls the content area as it would the
  // document.
  useScrollKeys(titleBar ? shellElement : null, scrollingContent);
  useTopbarBlockSize(titleBar ? null : shellElement);
  const setShell = useCallback((node: HTMLDivElement | null) => {
    shell.current = node;
    setShellElement(node);
  }, []);
  const setContent = useCallback((node: HTMLElement | null) => {
    content.current = node;
    setContentElement(node);
  }, []);
  const shellApi = useMemo(
    () => ({ closeNarrowSidebar, getScrollElement }),
    [closeNarrowSidebar, getScrollElement],
  );

  function changeWidth(next: number, persist: boolean) {
    const width = clampWidth(next, bounds);
    if (controlledWidth === undefined) {
      setChosenWidth(width);
      if (persist) writeStored(chosenWidthKey(storageKey), String(width));
    }
    if (width !== resizableWidth) onSidebarWidthChange?.(width);
  }

  function inlineDirection(element: Element) {
    return getComputedStyle(element).direction === 'rtl' ? -1 : 1;
  }

  function startResize(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    // Dragging selects no text and leaves focus where it is.
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: resizableWidth,
      startChosen: chosenWidth,
      direction: inlineDirection(event.currentTarget),
    };
    setResizing(true);
  }

  function moveResize(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    changeWidth(current.startWidth + (event.clientX - current.startX) * current.direction, false);
  }

  function endResize(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (event.type !== 'pointercancel') {
      changeWidth(current.startWidth + (event.clientX - current.startX) * current.direction, true);
      return;
    }
    // A cancelled drag, such as one the browser took over for scrolling, returns to where it began,
    // including following the measured width when nothing was chosen yet.
    if (controlledWidth === undefined) setChosenWidth(current.startChosen);
    if (current.startWidth !== resizableWidth) onSidebarWidthChange?.(current.startWidth);
  }

  function resizeWithKeyboard(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? resizeLargeStep : resizeStep;
    const direction = inlineDirection(event.currentTarget);
    let next: number;
    if (event.key === 'ArrowRight') next = resizableWidth + step * direction;
    else if (event.key === 'ArrowLeft') next = resizableWidth - step * direction;
    else if (event.key === 'Home') next = bounds.min;
    else if (event.key === 'End') next = bounds.max;
    else return;
    event.preventDefault();
    changeWidth(next, true);
  }

  useEffect(() => {
    if (!narrowOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNarrowOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [narrowOpen]);

  const regionHandlers = {
    onPointerEnter: () => setRegionHovered(true),
    onPointerLeave: () => {
      setRegionHovered(false);
      setHoverSuppressed(false);
    },
  };

  function closeAfterNavigation(event: MouseEvent<HTMLElement>) {
    if (isNarrow && (event.target as Element).closest('a[href]')) setNarrowOpen(false);
  }

  const toggleLabel = isNarrow
    ? narrowOpen
      ? collapseLabel
      : expandLabel
    : collapsed
      ? expandLabel
      : collapseLabel;

  return (
    <AppShellContext value={shellApi}>
      <div
        ref={setShell}
        className={classNames('env-app-shell', className)}
        style={
          resizable ? sidebarWidthStyle(resizableWidth, bounds) : sidebarWidthStyle(contentWidth)
        }
        data-ready={ready ? '' : undefined}
        data-resizing={resizing ? '' : undefined}
        data-collapsed={collapsed && !isNarrow ? '' : undefined}
        data-compact={compact ? '' : undefined}
        data-expanded-overlay={hoverExpanded ? '' : undefined}
        data-narrow={isNarrow ? '' : undefined}
        data-narrow-open={isNarrow && narrowOpen ? '' : undefined}
        data-region-hovered={regionHovered ? '' : undefined}
        data-dividers={dividers ? '' : undefined}
        data-topbar={full ? 'full' : undefined}
        data-title-bar={titleBar ? '' : undefined}
      >
        <header className={classNames('env-app-topbar', titleBar && 'env-title-bar')}>
          {/* The split topbar's context area sits above the sidebar and belongs to its region; in a
              full topbar only the toggle does. */}
          <div
            className="env-app-topbar-context"
            ref={contextRegion}
            {...(full ? undefined : regionHandlers)}
          >
            <button
              type="button"
              className="env-app-sidebar-toggle"
              aria-label={toggleLabel}
              title={toggleLabel}
              aria-expanded={isNarrow ? narrowOpen : !collapsed}
              onClick={toggleSidebar}
              {...(full ? regionHandlers : undefined)}
            >
              <span className="env-app-brand" aria-hidden="true">
                {brand}
              </span>
              <span className="env-app-toggle-icon env-icon" aria-hidden="true">
                <DockToRight />
              </span>
            </button>
            {context != null && <div className="env-app-context">{context}</div>}
          </div>
          <div className="env-app-topbar-page">
            <span className="env-app-title">{title}</span>
            {actions != null && <div className="env-app-actions">{actions}</div>}
          </div>
          <LoadingBar
            active={loading}
            label={loadingLabel}
            contained
            className="env-app-loading-bar"
          />
        </header>
        <aside
          className="env-app-sidebar"
          ref={sidebarRegion}
          hidden={!sidebarVisible}
          onFocus={() => setFocusWithin(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null))
              setFocusWithin(false);
          }}
          onClick={closeAfterNavigation}
          {...regionHandlers}
        >
          {/* The sidebar tells its content where it is: InSidebarContext, so AccountMenu's automatic
              trigger is a row, and SidebarCompactContext while it shows icons only. A shell that
              replaces this one must keep providing both. */}
          <InSidebarContext value>
            <nav className="env-app-navigation" aria-label={navigationLabel} ref={navigationRegion}>
              <SidebarCompactContext value={compact}>{navigation}</SidebarCompactContext>
            </nav>
            {sidebarContent != null && (
              <div className="env-app-sidebar-content" ref={sidebarContentRegion}>
                {sidebarContent}
              </div>
            )}
          </InSidebarContext>
          {resizable && !collapsed && !isNarrow && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label={resizeLabel}
              aria-valuenow={resizableWidth}
              aria-valuemin={Math.round(bounds.min)}
              aria-valuemax={Math.round(bounds.max)}
              tabIndex={0}
              className="env-app-sidebar-resize"
              onPointerDown={startResize}
              onPointerMove={moveResize}
              onPointerUp={endResize}
              onPointerCancel={endResize}
              onKeyDown={resizeWithKeyboard}
            />
          )}
        </aside>
        {isNarrow && narrowOpen && (
          <div
            className="env-app-sidebar-backdrop"
            aria-hidden="true"
            onClick={closeNarrowSidebar}
          />
        )}
        <main className="env-app-content" tabIndex={-1} ref={setContent}>
          {children}
        </main>
      </div>
    </AppShellContext>
  );
}

export interface AppShellSkeletonProps
  extends Omit<AppShellFrameProps, 'title' | 'actions' | 'context'> {
  /** Accessible loading announcement. */
  label?: string;
  /** Number of navigation placeholders. Defaults to 3. */
  navigationItems?: number;
  /** Match the stored collapsed preference of the AppShell it precedes. */
  storageKey?: string;
  /** Match the defaultCollapsed of the AppShell it precedes. */
  defaultCollapsed?: boolean;
  /** Match a resizable AppShell's stored width and bounds. */
  resizable?: boolean;
  /** Match the AppShell's smallest resizable width in pixels; 12 rem by default. */
  sidebarMinWidth?: number;
  /** Match the AppShell's largest resizable width in pixels; 32 rem by default. */
  sidebarMaxWidth?: number;
  /** Placeholder for the page content. */
  children?: ReactNode;
}

/** The topbars of the shells in each document, with their heights. */
const documentTopbars = new WeakMap<Document, Map<HTMLElement, number>>();

/** Writes the tallest topbar of a document's shells, which its scroll padding follows. */
function publishTopbarBlockSize(page: Document) {
  const heights = documentTopbars.get(page);
  const root = page.documentElement;
  if (!heights?.size) root.style.removeProperty('--env-app-topbar-block-size');
  else root.style.setProperty('--env-app-topbar-block-size', `${Math.max(...heights.values())}px`);
}

/**
 * Measures the topbar of a shell whose document scrolls under it, so the document's scroll padding
 * keeps focus and anchor targets below the topbar however tall it is. Only the namespaced custom
 * property is written on the document element; the padding itself comes from a style rule.
 */
function useTopbarBlockSize(shellElement: HTMLElement | null) {
  useLayoutEffect(() => {
    const topbar = shellElement?.querySelector<HTMLElement>(':scope > .env-app-topbar');
    if (!topbar) return;
    const page = topbar.ownerDocument;
    let heights = documentTopbars.get(page);
    if (!heights) documentTopbars.set(page, (heights = new Map()));
    const shellTopbars = heights;
    const update = () => {
      // A topbar without a box, hidden or taken out of the document, measures 0, so a shell that is
      // hidden alone keeps nothing clear but the margin.
      shellTopbars.set(topbar, topbar.offsetHeight);
      publishTopbarBlockSize(page);
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(topbar);
    return () => {
      observer?.disconnect();
      shellTopbars.delete(topbar);
      publishTopbarBlockSize(page);
    };
  }, [shellElement]);
}

/** The AppShell frame with placeholders, for the first load before account data is available. */
export function AppShellSkeleton({
  brand,
  dividers = true,
  topbar = 'split',
  titleBar = false,
  className,
  label = 'Loading',
  navigationItems = 3,
  storageKey,
  defaultCollapsed = false,
  resizable = false,
  sidebarMinWidth,
  sidebarMaxWidth,
  children,
}: AppShellSkeletonProps) {
  const isNarrow = useMedia(narrowQuery);
  const [collapsed] = useState(() => readStoredCollapsed(storageKey, defaultCollapsed));
  const [contentWidth, setContentWidth] = useState<number>();
  const { bounds, rem } = useWidthBounds(sidebarMinWidth, sidebarMaxWidth);
  // Applied after mount, like AppShell's, so server-rendered markup matches the first render. A
  // resizable shell starts, like AppShell, at the chosen width, else at the measured width up to
  // 20 rem.
  useLayoutEffect(() => {
    const { chosen, measured } = readStartWidth(storageKey, resizable);
    const capped =
      resizable && measured !== undefined ? Math.min(measured, measuredMaxRem * rem) : measured;
    setContentWidth(chosen ?? capped);
  }, [storageKey, resizable, rem]);
  return (
    <LoadingState label={label} className={classNames('env-app-shell-skeleton', className)}>
      <div
        className="env-app-shell"
        style={sidebarWidthStyle(contentWidth, resizable ? bounds : undefined)}
        aria-hidden="true"
        data-collapsed={collapsed && !isNarrow ? '' : undefined}
        data-compact={collapsed && !isNarrow ? '' : undefined}
        data-narrow={isNarrow ? '' : undefined}
        data-dividers={dividers ? '' : undefined}
        data-topbar={topbar === 'full' ? 'full' : undefined}
        data-title-bar={titleBar ? '' : undefined}
      >
        <div className={classNames('env-app-topbar', titleBar && 'env-title-bar')}>
          <div className="env-app-topbar-context">
            <span className="env-app-sidebar-toggle">
              <span className="env-app-brand">{brand}</span>
            </span>
            <span className="env-app-context">
              <Skeleton width="min(9rem, 100%)" height="0.75rem" />
            </span>
          </div>
          <div className="env-app-topbar-page">
            <Skeleton className="env-app-title" width="3rem" height="0.75rem" />
            <span className="env-app-actions">
              <Skeleton width="1.75rem" height="1.75rem" style={{ borderRadius: '50%' }} />
              <Skeleton width="1.75rem" height="1.75rem" style={{ borderRadius: '50%' }} />
            </span>
          </div>
        </div>
        {!isNarrow && (
          <div className="env-app-sidebar">
            <div className="env-app-navigation">
              {Array.from({ length: navigationItems }, (_, index) => (
                <span className="env-app-navigation-placeholder" key={index}>
                  <Skeleton width="1.125rem" height="1.125rem" />
                  <Skeleton
                    className="env-app-navigation-placeholder-label"
                    width={`${4.25 + ((index * 1.5) % 2.5)}rem`}
                    height="0.75rem"
                  />
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="env-app-content">{children}</div>
      </div>
    </LoadingState>
  );
}
