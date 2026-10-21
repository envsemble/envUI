'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { breakpointQuery, type Breakpoint } from './frameBreakpoints.js';
import { useMediaQuery } from '../../internal/useMediaQuery.js';
import { useShortcut } from '../../internal/useShortcut.js';
import {
  appShellCookie,
  parseAppShellState,
  parseStoredAppShellState,
  readCookie,
  type AppShellState,
  type PerSide,
  type PersistOptions,
  type SidebarSide,
  type SidebarSnapshot,
} from './persistence.js';

/** Why a sidebar opened, closed or was dismissed. */
export type SidebarChangeReason =
  | 'trigger'
  | 'shortcut'
  | 'handle'
  | 'navigate'
  | 'escape'
  | 'outside-press'
  | 'breakpoint'
  | 'api';

/** The frame's sidebar state: on AppShell.Root, or on Sidebar.Provider for a sidebar on its own. */
export interface FrameStateProps {
  /**
   * Whether a sidebar starts docked open where people can dock it; a bare value is the start
   * sidebar's.
   * @default true
   */
  defaultSidebarOpen?: PerSide<boolean>;
  /** Whether a sidebar is docked open, for state the application controls; per side. */
  sidebarOpen?: PerSide<boolean>;
  /**
   * Called as a sidebar's docked preference changes: from its trigger, the shortcut, its handle or
   * useSidebar().setOpen.
   */
  onSidebarOpenChange?: (
    open: boolean,
    details: { side: SidebarSide; reason: SidebarChangeReason },
  ) => void;
  /** The width a resizable sidebar starts at, in rem; per side. */
  defaultSidebarWidth?: PerSide<number>;
  /** A resizable sidebar's width in rem, for state the application controls; per side. */
  sidebarWidth?: PerSide<number>;
  /**
   * Called with the new width in rem while a sidebar is resized (committed false) and once more as
   * the drag ends or a key moves it (committed true).
   */
  onSidebarWidthChange?: (
    width: number,
    details: { side: SidebarSide; committed: boolean },
  ) => void;
  /**
   * Remember the docked preference and the chosen width of each sidebar under this key: a string
   * keeps them in localStorage, read after hydration; { key, storage: 'cookie' } keeps them in a
   * cookie the server reads with readAppShellCookie. Peeking and the drawers are never kept.
   */
  persist?: string | PersistOptions;
  /**
   * The state the server read with readAppShellCookie, so hydration meets the server's markup.
   * Without it the frame reads its storage after hydration: a server-rendered page first shows the
   * defaults, and a page rendered only in the browser reads it before its first paint.
   */
  initialState?: AppShellState;
  /**
   * Below this viewport width the sidebars become drawers opened from their triggers: sm, md, lg
   * or xl (40, 48, 64 or 80 rem). md also covers short landscape windows, such as a phone's.
   * @default 'md'
   */
  breakpoint?: Breakpoint;
  /**
   * A keyboard shortcut that toggles a sidebar, or its drawer below the breakpoint, such as mod+b
   * (⌘B on Apple platforms, Ctrl+B elsewhere); a bare value is the start sidebar's. It is ignored in
   * text fields and editors, where Mod+B is often Bold. false listens for nothing.
   * @default false
   */
  shortcut?: PerSide<string | false>;
}

/** What a sidebar tells the frame about itself as it mounts. */
export interface SidebarRegistration {
  /** The id of the inline sidebar and of its drawer, which triggers control. */
  id: string;
  label: string;
  collapsible: 'offcanvas' | 'rail' | 'none';
  dockAt: Breakpoint;
  mobile: 'drawer' | 'none';
  /** A frame-level sidebar, or AppShell.Aside, the page's region at the end. */
  region: 'sidebar' | 'aside';
}

/** The state of one side of the frame. */
export interface SideState {
  /** The docked preference: open where people can dock the sidebar. */
  open: boolean;
  /** The chosen width in rem, if any. */
  width: number | undefined;
  /** A collapsed sidebar shown expanded over the content, while hovered or focused. */
  peek: boolean;
  /** A collapsed sidebar held open over the content by its trigger. */
  held: boolean;
  /** The drawer below the breakpoint is open. */
  openMobile: boolean;
  /** At or above the sidebar's dockAt, where people can dock it expanded. */
  canDock: boolean;
  /** The sidebar on this side, once it has mounted. */
  registration: SidebarRegistration | undefined;
}

export interface FrameStore {
  /** Inside AppShell.Root rather than a Sidebar.Provider of its own. */
  inShell: boolean;
  breakpoint: Breakpoint;
  /** Below the breakpoint; false on the server and while hydrating. */
  isMobile: boolean;
  /** After the first frame, so nothing animates on load. */
  ready: boolean;
  sides: Record<SidebarSide, SideState>;
  shortcuts: Record<SidebarSide, string | false>;
  setOpen(side: SidebarSide, open: boolean, reason: SidebarChangeReason): void;
  setWidth(side: SidebarSide, width: number, committed: boolean): void;
  setPeek(side: SidebarSide, peek: boolean): void;
  setHeld(side: SidebarSide, held: boolean): void;
  setOpenMobile(side: SidebarSide, open: boolean, reason: SidebarChangeReason): void;
  /** What a trigger press or the shortcut does: dock, hold or open the drawer, by the window. */
  toggle(side: SidebarSide, reason: SidebarChangeReason): void;
  /** Closes the drawer, a peek or a held rail; a docked sidebar stays. */
  dismiss(side: SidebarSide, reason: SidebarChangeReason): void;
  /** Counts dismissals per side, so the sidebar lets go of the pointer and focus that held it. */
  dismissals: Record<SidebarSide, number>;
  /** Why the drawer last closed, for where focus goes. */
  closeReasons: { current: Record<SidebarSide, SidebarChangeReason | undefined> };
  /**
   * Registers the sidebar on a side and returns the function that takes it back. Where two register
   * on one side the latest shows, and the earlier one returns as the latest goes.
   */
  register(side: SidebarSide, registration: SidebarRegistration): () => void;
  /**
   * The id each side's sidebar takes unless it is given one, so a trigger rendered on the server
   * controls it before the sidebar registers.
   */
  sideIds: Record<SidebarSide, string>;
  /** The id of AppShell.Main, for skip links and focus after navigation, and its skip link's name. */
  mainId: string;
  mainLabel: string | undefined;
  setMainId(id: string, label?: string): void;
}

/** What the frame's parts know of AppShell.Root. */
export interface FrameShape {
  landmarks: boolean;
  scroll: 'document' | 'main';
  headerSpan: 'main' | 'full';
  titleBar: boolean;
  /** AppShell.Header and AppShell.Main attach themselves. */
  setHeader(element: HTMLElement | null): void;
  setMain(element: HTMLElement | null): void;
}

export const FrameShapeContext = createContext<FrameShape | null>(null);

/**
 * True among AppShell.Root's own children, where a Sidebar.Root is one of the frame's regions.
 * AppShell.Header, AppShell.Main and a sidebar's content are not, so a Sidebar.Root there, such as
 * a settings page's sub-navigation, keeps a state of its own.
 */
export const FrameSlotContext = createContext(false);

const ignore = () => {};

/**
 * The frame's shape for a sidebar state nested in it, as Sidebar.Provider and a sidebar on its own
 * keep: landmarks as the frame renders them, but no part of its title bar.
 */
export function useNestedShape(): FrameShape | null {
  const parent = useContext(FrameShapeContext);
  return useMemo(
    () => parent && { ...parent, titleBar: false, setHeader: ignore, setMain: ignore },
    [parent],
  );
}

export const FrameContext = createContext<FrameStore | null>(null);

/** The frame store, or null outside AppShell.Root and Sidebar.Provider. */
export function useFrameStore() {
  return useContext(FrameContext);
}

export const defaultMainId = 'env-app-shell-main';

/** A per-side value for one side: a bare value is the start side's. */
export function forSide<T>(value: PerSide<T> | undefined, side: SidebarSide): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'object' && !Array.isArray(value))
    return (value as Partial<Record<SidebarSide, T>>)[side];
  return side === 'start' ? (value as T) : undefined;
}

const order: Breakpoint[] = ['sm', 'md', 'lg', 'xl'];

/**
 * The media query for a viewport below a frame's breakpoint, where its sidebars are drawers. md
 * also covers short landscape windows, such as a phone's, as the frame's CSS does.
 */
export function mobileQuery(breakpoint: Breakpoint) {
  const below = breakpointQuery(breakpoint, 'down');
  return breakpoint === 'md' ? `${below}, (max-height: 32rem) and (max-width: 54rem)` : below;
}

/** Whether dockAt is wider than the breakpoint, so a rail shows between them. */
export function docksLater(dockAt: Breakpoint, breakpoint: Breakpoint) {
  return order.indexOf(dockAt) > order.indexOf(breakpoint);
}

function persistOptions(persist: FrameStateProps['persist']): PersistOptions | undefined {
  if (!persist) return undefined;
  return typeof persist === 'string' ? { key: persist, storage: 'local' } : persist;
}

function readLocal(key: string) {
  try {
    return parseStoredAppShellState(window.localStorage.getItem(key));
  } catch {
    return undefined;
  }
}

function readStoredCookie(key: string) {
  try {
    const value = readCookie(document.cookie, key);
    return value ? parseAppShellState(value) : undefined;
  } catch {
    return undefined;
  }
}

function writeState(options: PersistOptions, state: AppShellState) {
  try {
    if (options.storage === 'cookie')
      document.cookie = appShellCookie(
        options.key,
        state,
        options.cookie,
        window.location.protocol === 'https:',
      );
    else window.localStorage.setItem(options.key, JSON.stringify(state));
  } catch {
    // The frame still works where storage is unavailable.
  }
}

const sides: SidebarSide[] = ['start', 'end'];

/**
 * Whether the application runs in development. Written inline so bundlers replace
 * process.env.NODE_ENV, as in Theme.
 */
function developing() {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    // No bundler defined process.env.NODE_ENV.
    return false;
  }
}
const closed = { start: false, end: false };
const sideRecord = <T>(value: T): Record<SidebarSide, T> => ({ start: value, end: value });

/** The frame's sidebar state, for AppShell.Root and Sidebar.Provider. */
export function useFrameState(props: FrameStateProps, inShell: boolean): FrameStore {
  const {
    defaultSidebarOpen,
    sidebarOpen,
    defaultSidebarWidth,
    sidebarWidth,
    persist,
    initialState,
    breakpoint = 'md',
    shortcut,
  } = props;
  const options = persistOptions(persist);
  const key = options?.key;
  const storage = options?.storage ?? 'local';
  // Controlled props, then the server's state, then storage, then the defaults.
  const [stored, setStored] = useState<AppShellState>(() => initialState ?? {});
  // Storage is read after hydration, so the server's markup and the first render agree; in a layout
  // effect, so a page rendered only in the browser shows it from its first paint. A server-rendered
  // page passes initialState, read with readAppShellCookie, to paint it from the start.
  useLayoutEffect(() => {
    if (!key || initialState) return;
    const state = storage === 'cookie' ? readStoredCookie(key) : readLocal(key);
    if (state) setStored(state);
    // The server's state is read once, as the frame mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, storage]);
  // What a save merges into: the latest state, with a save earlier in the same event.
  const storedRef = useRef(stored);
  storedRef.current = stored;

  const [peek, setPeekState] = useState(closed);
  const [held, setHeldState] = useState(closed);
  const [openMobile, setOpenMobileState] = useState(closed);
  const [dismissals, setDismissals] = useState(() => sideRecord(0));
  const [registrations, setRegistrations] = useState<
    Record<SidebarSide, SidebarRegistration | undefined>
  >(() => sideRecord(undefined));
  const [main, setMain] = useState<{ id: string; label?: string }>({ id: defaultMainId });
  const setMainId = useCallback(
    (id: string, label?: string) =>
      setMain((current) =>
        current.id === id && current.label === label ? current : { id, label },
      ),
    [],
  );
  const closeReasons = useRef<Record<SidebarSide, SidebarChangeReason | undefined>>(
    sideRecord(undefined),
  );
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const isMobile = useMediaQuery(mobileQuery(breakpoint));
  // Each side docks from its sidebar's dockAt up; at the breakpoint itself it always can.
  const dockQuery = (side: SidebarSide) => {
    const dockAt = registrations[side]?.dockAt;
    return dockAt && docksLater(dockAt, breakpoint)
      ? breakpointQuery(dockAt)
      : // A query that always matches, so the hook's order never changes.
        `(width >= 0px)`;
  };
  const startDocks = useMediaQuery(dockQuery('start'), { defaultValue: true });
  const endDocks = useMediaQuery(dockQuery('end'), { defaultValue: true });
  const canDock = { start: startDocks, end: endDocks };

  const resolveOpen = (side: SidebarSide) =>
    forSide(sidebarOpen, side) ?? stored[side]?.open ?? forSide(defaultSidebarOpen, side) ?? true;
  const resolveWidth = (side: SidebarSide) =>
    forSide(sidebarWidth, side) ?? stored[side]?.width ?? forSide(defaultSidebarWidth, side);

  // The functions read the latest state through a ref, so they keep their identity.
  const latest = useRef({ resolveOpen, resolveWidth, props, options, canDock, isMobile, peek });
  latest.current = { resolveOpen, resolveWidth, props, options, canDock, isMobile, peek };
  const heldRef = useRef(held);
  heldRef.current = held;
  const openMobileRef = useRef(openMobile);
  openMobileRef.current = openMobile;
  const registrationsRef = useRef(registrations);
  registrationsRef.current = registrations;

  const save = useCallback((side: SidebarSide, snapshot: Partial<SidebarSnapshot>) => {
    const { resolveOpen: open, resolveWidth: width, options: persisted } = latest.current;
    const before = storedRef.current;
    const next: AppShellState = {};
    for (const each of sides) {
      if (each !== side && !registrationsRef.current[each]) {
        // A side without a sidebar now keeps what it stored, such as one on another page.
        if (before[each]) next[each] = before[each];
        continue;
      }
      const current = { open: open(each), width: width(each) };
      const merged = each === side ? { ...current, ...snapshot } : current;
      next[each] =
        merged.width === undefined
          ? { open: merged.open }
          : { open: merged.open, width: merged.width };
    }
    storedRef.current = { ...before, [side]: next[side] };
    setStored(storedRef.current);
    if (persisted) writeState(persisted, next);
  }, []);

  const setPeek = useCallback((side: SidebarSide, value: boolean) => {
    setPeekState((current) => (current[side] === value ? current : { ...current, [side]: value }));
  }, []);
  const setHeld = useCallback((side: SidebarSide, value: boolean) => {
    setHeldState((current) => (current[side] === value ? current : { ...current, [side]: value }));
  }, []);
  const setOpenMobile = useCallback(
    (side: SidebarSide, value: boolean, reason: SidebarChangeReason) => {
      if (!value) closeReasons.current[side] = reason;
      setOpenMobileState((current) =>
        current[side] === value ? current : { ...current, [side]: value },
      );
    },
    [],
  );
  const setOpen = useCallback(
    (side: SidebarSide, value: boolean, reason: SidebarChangeReason) => {
      if (latest.current.resolveOpen(side) === value) return;
      // Docking or collapsing ends a peek or a hold.
      setHeld(side, false);
      setPeek(side, false);
      if (!value) setDismissals((current) => ({ ...current, [side]: current[side] + 1 }));
      save(side, { open: value });
      latest.current.props.onSidebarOpenChange?.(value, { side, reason });
    },
    [save, setHeld, setPeek],
  );
  const setWidth = useCallback(
    (side: SidebarSide, value: number, committed: boolean) => {
      const width = Math.round(value * 100) / 100;
      if (committed) save(side, { width });
      else if (forSide(latest.current.props.sidebarWidth, side) === undefined)
        setStored((current) => ({
          ...current,
          [side]: { open: latest.current.resolveOpen(side), width },
        }));
      latest.current.props.onSidebarWidthChange?.(width, { side, committed });
    },
    [save],
  );
  const dismiss = useCallback(
    (side: SidebarSide, reason: SidebarChangeReason) => {
      if (openMobileRef.current[side]) setOpenMobile(side, false, reason);
      setHeld(side, false);
      setPeek(side, false);
      setDismissals((current) => ({ ...current, [side]: current[side] + 1 }));
    },
    [setHeld, setOpenMobile, setPeek],
  );
  const toggle = useCallback(
    (side: SidebarSide, reason: SidebarChangeReason) => {
      const { isMobile: mobile, canDock: docks, resolveOpen: open, peek: peeking } = latest.current;
      const registration = registrationsRef.current[side];
      if (mobile) {
        if (registration?.mobile === 'none') return;
        setOpenMobile(side, !openMobileRef.current[side], reason);
        return;
      }
      if (registration?.collapsible === 'none') return;
      const shown = peeking[side] || heldRef.current[side];
      if (docks[side]) {
        // Over the content, the trigger docks it ("Keep sidebar open").
        if (!open(side) && shown) setOpen(side, true, reason);
        else setOpen(side, !open(side), reason);
        return;
      }
      // Between the breakpoint and dockAt, the trigger holds the rail open or closes it.
      if (shown) dismiss(side, reason);
      else setHeld(side, true);
    },
    [dismiss, setHeld, setOpen, setOpenMobile],
  );
  // Every sidebar registered on a side, latest last: the latest shows, and as it goes the one before
  // returns, so no other region's leaving takes a side's sidebar away.
  const stacks = useRef<Record<SidebarSide, { registration: SidebarRegistration }[]>>({
    start: [],
    end: [],
  });
  const register = useCallback((side: SidebarSide, registration: SidebarRegistration) => {
    const existing = stacks.current[side].at(-1)?.registration;
    if (existing && existing.id !== registration.id && developing())
      // A development-only report, as React reports an invalid prop.
      // eslint-disable-next-line no-console
      console.error(
        `envUI: the ${side} side of the frame has two regions, ${existing.label} and ${registration.label}. Keep one Sidebar.Root or one AppShell.Aside per side.`,
      );
    const entry = { registration };
    stacks.current[side] = [...stacks.current[side], entry];
    setRegistrations((current) => ({ ...current, [side]: registration }));
    return () => {
      stacks.current[side] = stacks.current[side].filter((each) => each !== entry);
      const top = stacks.current[side].at(-1)?.registration;
      setRegistrations((current) =>
        current[side] === top ? current : { ...current, [side]: top },
      );
    };
  }, []);
  const baseId = useId();
  const sideIds = useMemo(
    () => ({ start: `${baseId}-start-sidebar`, end: `${baseId}-end-sidebar` }),
    [baseId],
  );

  // Widening past the breakpoint closes the drawers; their sidebars show inline again.
  useEffect(() => {
    if (isMobile) {
      setHeldState(closed);
      setPeekState(closed);
      return;
    }
    for (const side of sides)
      if (openMobileRef.current[side]) setOpenMobile(side, false, 'breakpoint');
  }, [isMobile, setOpenMobile]);
  // Reaching dockAt ends a hold; the docked preference applies there.
  useEffect(() => {
    if (startDocks) setHeld('start', false);
  }, [startDocks, setHeld]);
  useEffect(() => {
    if (endDocks) setHeld('end', false);
  }, [endDocks, setHeld]);

  const shortcuts = {
    start: forSide(shortcut, 'start') ?? false,
    end: forSide(shortcut, 'end') ?? false,
  };
  useShortcut(shortcuts.start, () => toggle('start', 'shortcut'), {
    enabled: registrations.start !== undefined,
  });
  useShortcut(shortcuts.end, () => toggle('end', 'shortcut'), {
    enabled: registrations.end !== undefined,
  });

  const sideState = (side: SidebarSide): SideState => ({
    open: resolveOpen(side),
    width: resolveWidth(side),
    peek: peek[side],
    held: held[side],
    openMobile: openMobile[side],
    canDock: canDock[side],
    registration: registrations[side],
  });
  const start = sideState('start');
  const end = sideState('end');
  return useMemo(
    () => ({
      inShell,
      breakpoint,
      isMobile,
      ready,
      sides: { start, end },
      shortcuts,
      setOpen,
      setWidth,
      setPeek,
      setHeld,
      setOpenMobile,
      toggle,
      dismiss,
      dismissals,
      closeReasons,
      register,
      sideIds,
      mainId: main.id,
      mainLabel: main.label,
      setMainId,
    }),
    // The sides' fields are listed one by one, so an unchanged frame keeps its value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      inShell,
      breakpoint,
      isMobile,
      ready,
      start.open,
      start.width,
      start.peek,
      start.held,
      start.openMobile,
      start.canDock,
      start.registration,
      end.open,
      end.width,
      end.peek,
      end.held,
      end.openMobile,
      end.canDock,
      end.registration,
      shortcuts.start,
      shortcuts.end,
      dismissals,
      main,
      sideIds,
    ],
  );
}

/** Provides the frame state; AppShell.Root and Sidebar.Provider render it. */
export function FrameProvider({ value, children }: { value: FrameStore; children: ReactNode }) {
  return createElement(FrameContext, { value }, children);
}
