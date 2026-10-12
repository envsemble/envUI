import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
import { LoadingBar } from '../feedback/LoadingBar.js';

/** Viewports where the sidebar becomes an overlay opened from the topbar. */
const narrowQuery = '(max-width: 40rem), (max-height: 32rem) and (max-width: 54rem)';
/** Hover expansion needs a precise pointer; touch input toggles instead. */
const hoverQuery = '(hover: hover) and (pointer: fine)';

const SidebarCompactContext = createContext(false);

/** True while the shell sidebar shows icons only; NavigationItem follows it automatically. */
export function useSidebarCompact() {
  return useContext(SidebarCompactContext);
}

interface AppShellContextValue {
  /** Close the overlay sidebar on narrow viewports; no effect elsewhere. */
  closeNarrowSidebar: () => void;
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

function readStoredWidth(storageKey: string | undefined) {
  const width = Number(readStored(widthKey(storageKey)));
  return Number.isFinite(width) && width > 0 ? width : undefined;
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
  /** Content above the sidebar in the topbar, such as an organization switcher. Hidden while compact. */
  context?: ReactNode;
  /** Current page name in the topbar. Hidden on narrow viewports. */
  title?: ReactNode;
  /** Topbar actions at the end, such as a ThemeToggle and an account Menu. */
  actions?: ReactNode;
  /** Separator lines between the topbar, sidebar and content (default). */
  dividers?: boolean;
  className?: string;
}

export interface AppShellProps extends AppShellFrameProps {
  /** NavigationItem elements for the sidebar. */
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
  defaultCollapsed?: boolean;
  /** Controlled collapsed preference on wide viewports. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Labels for the sidebar toggle. */
  expandLabel?: string;
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
  const shell = useRef<HTMLDivElement>(null);
  const navigationRegion = useRef<HTMLElement>(null);
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
  const sidebarVisible = !isNarrow || narrowOpen;
  const measurable = !compact && sidebarVisible;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // The stored width applies after mount, so server-rendered markup and the first client render
  // agree; it still arrives before the first paint.
  // While resizable, the stored width is the chosen one.
  useLayoutEffect(() => {
    const stored = readStoredWidth(storageKey);
    if (stored === undefined) return;
    if (resizable) setChosenWidth((current) => current ?? stored);
    else setContentWidth((current) => current ?? stored);
  }, [storageKey, resizable]);

  // The expanded sidebar fits its widest content: the navigation or the context beside the toggle.
  // Both are measured at their natural width, which only shows while labels are visible.
  const measureSidebar = useCallback(() => {
    const frame = shell.current;
    const navigation = navigationRegion.current;
    const context = contextRegion.current;
    // Compact and hidden sidebars show no labels to measure; the last width stays. A width chosen
    // by resizing stays as it is.
    if (!frame || !navigation || !context || widthChosenRef.current) return;
    if (frame.hasAttribute('data-compact') || sidebarRegion.current?.hidden) return;
    frame.setAttribute('data-measuring', '');
    const width = Math.ceil(
      Math.max(navigation.getBoundingClientRect().width, context.getBoundingClientRect().width),
    );
    frame.removeAttribute('data-measuring');
    // A shell inside a hidden ancestor measures nothing; unchanged widths need no update.
    if (width === 0 || width === measuredWidth.current) return;
    measuredWidth.current = width;
    setContentWidth(width);
    writeStored(widthKey(storageKey), String(width));
  }, [storageKey]);

  useLayoutEffect(() => {
    if (measurable) measureSidebar();
  }, [measurable, measureSidebar]);

  useEffect(() => {
    const regions = [navigationRegion.current, contextRegion.current].filter(
      (region): region is HTMLElement => region !== null,
    );
    const observer = new MutationObserver(measureSidebar);
    for (const region of regions) {
      observer.observe(region, { subtree: true, childList: true, characterData: true });
      // Images, such as an organization logo, change the width when they load.
      region.addEventListener('load', measureSidebar, true);
    }
    document.fonts?.addEventListener('loadingdone', measureSidebar);
    return () => {
      observer.disconnect();
      for (const region of regions) region.removeEventListener('load', measureSidebar, true);
      document.fonts?.removeEventListener('loadingdone', measureSidebar);
    };
  }, [measureSidebar]);

  useEffect(() => setNarrowOpen(false), [isNarrow]);

  // A popup opened from the sidebar region (its trigger has aria-expanded) keeps the sidebar expanded.
  useEffect(() => {
    const regions = [contextRegion.current, sidebarRegion.current].filter(
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
  }, []);

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

  function changeWidth(next: number, persist: boolean) {
    const width = clampWidth(next, bounds);
    if (controlledWidth === undefined) {
      setChosenWidth(width);
      if (persist) writeStored(widthKey(storageKey), String(width));
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
    changeWidth(current.startWidth + (event.clientX - current.startX) * current.direction, true);
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
    <AppShellContext value={{ closeNarrowSidebar }}>
      <div
        ref={shell}
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
      >
        <header className="env-app-topbar">
          <div className="env-app-topbar-context" ref={contextRegion} {...regionHandlers}>
            <button
              type="button"
              className="env-app-sidebar-toggle"
              aria-label={toggleLabel}
              title={toggleLabel}
              aria-expanded={isNarrow ? narrowOpen : !collapsed}
              onClick={toggleSidebar}
            >
              <span className="env-app-brand" aria-hidden="true">
                {brand}
              </span>
              <span className="env-app-toggle-icon env-symbol" aria-hidden="true">
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
          <nav className="env-app-navigation" aria-label={navigationLabel} ref={navigationRegion}>
            <SidebarCompactContext value={compact}>{navigation}</SidebarCompactContext>
          </nav>
          {sidebarContent != null && (
            <div className="env-app-sidebar-content">{sidebarContent}</div>
          )}
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
        <main className="env-app-content" tabIndex={-1}>
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
  defaultCollapsed?: boolean;
  /** Match a resizable AppShell's stored width and bounds. */
  resizable?: boolean;
  sidebarMinWidth?: number;
  sidebarMaxWidth?: number;
  /** Placeholder for the page content. */
  children?: ReactNode;
}

/** The AppShell frame with placeholders, for the first load before account data is available. */
export function AppShellSkeleton({
  brand,
  dividers = true,
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
  const { bounds } = useWidthBounds(sidebarMinWidth, sidebarMaxWidth);
  // Applied after mount, like AppShell's, so server-rendered markup matches the first render.
  useLayoutEffect(() => setContentWidth(readStoredWidth(storageKey)), [storageKey]);
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
      >
        <div className="env-app-topbar">
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
