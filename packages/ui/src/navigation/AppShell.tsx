import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
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

function sidebarWidthStyle(width: number | undefined) {
  return width === undefined
    ? undefined
    : ({ '--env-sidebar-content-width': `${width}px` } as CSSProperties);
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
  const [contentWidth, setContentWidth] = useState(() => readStoredWidth(storageKey));
  // Transitions start after the first paint, so the measured width never animates in on load.
  const [ready, setReady] = useState(false);

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

  // The expanded sidebar fits its widest content: the navigation or the context beside the toggle.
  // Both are measured at their natural width, which only shows while labels are visible.
  const measureSidebar = useCallback(() => {
    const frame = shell.current;
    const navigation = navigationRegion.current;
    const context = contextRegion.current;
    // Compact and hidden sidebars show no labels to measure; the last width stays.
    if (!frame || !navigation || !context) return;
    if (frame.hasAttribute('data-compact') || sidebarRegion.current?.hidden) return;
    frame.setAttribute('data-measuring', '');
    const width = Math.ceil(
      Math.max(navigation.getBoundingClientRect().width, context.getBoundingClientRect().width),
    );
    frame.removeAttribute('data-measuring');
    setContentWidth((current) => (current === width ? current : width));
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
    for (const region of regions)
      observer.observe(region, { subtree: true, childList: true, characterData: true });
    document.fonts?.addEventListener('loadingdone', measureSidebar);
    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener('loadingdone', measureSidebar);
    };
  }, [measureSidebar]);

  useEffect(() => setNarrowOpen(false), [isNarrow]);

  // A popup opened from the sidebar region (its trigger has aria-expanded) keeps the sidebar expanded.
  useEffect(() => {
    const regions = [contextRegion.current, sidebarRegion.current].filter(
      (region): region is HTMLElement => region !== null,
    );
    const update = () =>
      setPopupOpen(
        regions.some((region) =>
          region.querySelector('[aria-expanded="true"]:not(.env-app-sidebar-toggle)'),
        ),
      );
    const observer = new MutationObserver(update);
    for (const region of regions)
      observer.observe(region, {
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-expanded'],
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
        style={sidebarWidthStyle(contentWidth)}
        data-ready={ready ? '' : undefined}
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
  children,
}: AppShellSkeletonProps) {
  const isNarrow = useMedia(narrowQuery);
  const [collapsed] = useState(() => readStoredCollapsed(storageKey, defaultCollapsed));
  const [contentWidth] = useState(() => readStoredWidth(storageKey));
  return (
    <LoadingState label={label} className={classNames('env-app-shell-skeleton', className)}>
      <div
        className="env-app-shell"
        style={sidebarWidthStyle(contentWidth)}
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
