'use client';

import {
  Children,
  createContext,
  useContext,
  isValidElement,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { breakpointQuery, type Breakpoint } from '../../foundations/breakpoints.js';
import { classNames } from '../../internal/classNames.js';
import { setRef } from '../../internal/setRef.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { appShell } from '../../foundations/messages/appShell.js';
import { InSidebarContext, SidebarRailContext } from '../internal/SidebarCompact.js';
import {
  docksLater,
  FrameProvider,
  FrameShapeContext,
  FrameSlotContext,
  mobileQuery,
  useFrameState,
  useFrameStore,
  useNestedShape,
  type FrameStore,
} from '../app-shell/FrameStore.js';
import type { SidebarSide } from '../app-shell/persistence.js';
import { SidebarScopeContext, sidebarApi, type SidebarScope } from './SidebarScope.js';
import { usePeek } from './usePeek.js';
import { SidebarDrawer, tabbable } from './SidebarDrawer.js';

export interface SidebarProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * The frame's side the sidebar takes: start, the left in left-to-right text, or end.
   * @default 'start'
   */
  side?: SidebarSide;
  /** The sidebar's name: it names its landmark, its drawer and its skip link, such as Primary. */
  label: string;
  /**
   * The landmark it is: navigation, complementary, or none, for a sidebar whose navigation is
   * only part of its content and sits in a nav element of its own.
   * @default 'navigation' at the start, 'complementary' at the end
   */
  landmark?: 'navigation' | 'complementary' | 'none';
  /**
   * How it collapses: rail, to its icons in a narrow column; offcanvas, out of view; or none.
   * @default 'rail'
   */
  collapsible?: 'offcanvas' | 'rail' | 'none';
  /**
   * From this viewport width up people can dock it expanded; between the frame's breakpoint and
   * dockAt it is a rail that opens over the content.
   * @default the frame's breakpoint, so it can always dock
   */
  dockAt?: Breakpoint;
  /**
   * How a collapsed rail opens over the content: hover-focus, while the pointer rests on it or
   * keyboard focus is inside it; hover, only while the pointer rests on it (focus keeps an open one
   * open); or none, only from its trigger.
   * @default 'hover-focus'
   */
  peek?: 'hover-focus' | 'hover' | 'none';
  /**
   * Milliseconds the pointer rests on a rail before it opens over the content.
   * @default 200
   */
  peekDelay?: number;
  /**
   * The expanded width: content fits the content between 12 and 20 rem; a number is a width in
   * rem.
   * @default 'content'
   */
  width?: 'content' | number;
  /** People can resize the expanded sidebar by dragging Sidebar.Handle or with its arrow keys. */
  resizable?: boolean;
  /**
   * The smallest width in rem.
   * @default 12
   */
  minWidth?: number;
  /**
   * The largest width in rem.
   * @default 32 when resizable or with a number width, 20 with the content width
   */
  maxWidth?: number;
  /**
   * The handle's name.
   * @default 'Resize sidebar', or EnvUIProvider's messages.appShell.resizeSidebar
   */
  resizeLabel?: string;
  /**
   * A press on a link inside dismisses the drawer, a peek or a held rail.
   * @default true
   */
  closeOnNavigate?: boolean;
  /**
   * Below the frame's breakpoint: drawer, its content in a drawer its trigger opens; none, hidden,
   * for an application that brings its own.
   * @default 'drawer'
   */
  mobile?: 'drawer' | 'none';
  /** The sidebar's parts: Sidebar.Header, Sidebar.Content, Sidebar.Group, Sidebar.Footer, Sidebar.Handle. */
  children: ReactNode;
}

/** What Sidebar.Handle needs of its sidebar. */
export interface HandleScope {
  side: SidebarSide;
  /** The sidebar's id, which the handle controls. */
  id: string;
  resizable: boolean;
  /** Collapsed to its rail, or out of view. */
  collapsed: boolean;
  /** The expanded width in px, as laid out now. */
  value: number;
  min: number;
  max: number;
  remPixels: number;
  label: string;
  setWidth(pixels: number, committed: boolean): void;
  toggle(): void;
  setResizing(resizing: boolean): void;
}

export const HandleContext = createContext<HandleScope | null>(null);

/** Pixels per rem, read after mount so server-rendered markup and the first render agree. */
function useRemPixels() {
  const [pixels, setPixels] = useState(16);
  useLayoutEffect(() => {
    const size = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (Number.isFinite(size) && size > 0) setPixels(size);
  }, []);
  return pixels;
}

/**
 * The frame's provider, or a sidebar's own one (expanded, not remembered) where it has none or
 * isn't one of AppShell.Root's regions, such as a settings page's sub-navigation in AppShell.Main.
 */
export function WithFrame({ children }: { children: ReactNode }) {
  const store = useFrameStore();
  const inSlot = useContext(FrameSlotContext);
  return store && (!store.inShell || inSlot) ? children : <ImplicitFrame>{children}</ImplicitFrame>;
}

function ImplicitFrame({ children }: { children: ReactNode }) {
  const value = useFrameState({}, false);
  const shape = useNestedShape();
  return (
    <FrameProvider value={value}>
      <FrameShapeContext value={shape}>{children}</FrameShapeContext>
    </FrameProvider>
  );
}

/** The media query at or above a frame's breakpoint, where its sidebars show inline. */
function inlineQuery(breakpoint: Breakpoint) {
  return breakpoint === 'md'
    ? `${breakpointQuery('md')} and (not ((max-height: 32rem) and (max-width: 54rem)))`
    : breakpointQuery(breakpoint);
}

/** An id in a CSS string, its quotes and backslashes escaped. */
const cssString = (value: string) => `"${value.replace(/["\\]/g, '\\$&')}"`;

/**
 * Hides the triggers of a sidebar with nothing to toggle where it has nothing (collapsible none
 * above the breakpoint, mobile none below it), from the server's markup on, before the sidebar
 * registers; the triggers find it by aria-controls. A hoisted style, written once per sidebar.
 */
function TriggerStyle({
  ids,
  breakpoint,
  collapsible,
  mobile,
}: {
  ids: string[];
  breakpoint: Breakpoint;
  collapsible: string;
  mobile: string;
}) {
  const queries = [
    ...(collapsible === 'none' ? [inlineQuery(breakpoint)] : []),
    ...(mobile === 'none' ? [mobileQuery(breakpoint)] : []),
  ];
  if (queries.length === 0) return null;
  const selector = ids
    .map((id) => `.env-sidebar-trigger[aria-controls=${cssString(id)}]`)
    .join(',');
  const css =
    '@layer env.reset, env.tokens, env.base, env.components, env.utilities;' +
    `@layer env.components{${queries.map((query) => `@media ${query}{${selector}{display:none}}`).join('')}}`;
  return (
    <style
      href={`env-sidebar-trigger-${ids[0]!.replace(/\s+/g, '_')}-${collapsible}-${mobile}-${breakpoint}`}
      precedence="env"
    >
      {css}
    </style>
  );
}

/** Whether the children include a Sidebar.Handle, so none is added. */
function hasHandle(children: ReactNode, handle: unknown) {
  return Children.toArray(children).some((child) => isValidElement(child) && child.type === handle);
}

export interface SidebarRegionProps extends SidebarProps {
  /** AppShell.Aside, the page's region at the end, rather than a frame-level sidebar. */
  region?: 'sidebar' | 'aside';
  /** The Handle part, which the region looks for among its children. */
  handlePart: unknown;
  /** Renders the Handle part where the sidebar is resizable and has none. */
  renderHandle: () => ReactNode;
}

/** A sidebar inside a frame store; Sidebar.Root and AppShell.Aside render it. */
export function SidebarRegion(props: SidebarRegionProps) {
  const store = useFrameStore() as FrameStore;
  const {
    side = 'start',
    label,
    landmark = side === 'start' ? 'navigation' : 'complementary',
    collapsible = 'rail',
    dockAt: ownDockAt,
    peek = 'hover-focus',
    peekDelay = 200,
    width = 'content',
    resizable = false,
    minWidth: ownMin,
    maxWidth: ownMax,
    resizeLabel,
    closeOnNavigate = true,
    mobile = 'drawer',
    region = 'sidebar',
    handlePart,
    renderHandle,
    id: ownId,
    className,
    style,
    ref,
    children,
    ...rest
  } = props;
  const messages = useMessages('appShell', appShell);
  const id = ownId ?? store.sideIds[side];
  const dockAt = ownDockAt ?? store.breakpoint;
  // The element in a ref for reading, and in state for what attaches to it: below the breakpoint
  // the drawer replaces it, and a new one comes back.
  const element = useRef<HTMLElement | null>(null);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const attach = useCallback(
    (each: HTMLElement | null) => {
      element.current = each;
      setNode(each);
      setRef(ref, each as HTMLDivElement | null);
    },
    [ref],
  );

  const { register } = store;
  useLayoutEffect(
    () => register(side, { id, label, collapsible, dockAt, mobile, region }),
    [register, side, id, label, collapsible, dockAt, mobile, region],
  );

  const [triggers, setTriggers] = useState(0);
  const registerTrigger = useCallback(() => {
    setTriggers((count) => count + 1);
    return () => setTriggers((count) => count - 1);
  }, []);
  const state = store.sides[side];
  const api = sidebarApi(store, side, { side, id, label, collapsible, inDrawer: false });
  const isMobile = store.isMobile;
  const docked = collapsible === 'none' || (state.open && state.canDock);
  const collapsed = !docked;
  const shown = !isMobile && collapsed && (state.peek || state.held);
  const outOfView = collapsed && !shown && collapsible === 'offcanvas';

  const popupOpen = usePeek({
    element: node,
    side,
    id,
    store,
    active: !isMobile && collapsed,
    hoverable: collapsible === 'rail',
    mode: peek,
    delay: peekDelay,
    closeOnNavigate,
  });

  // Width: a chosen width, else the number given, else the content's, in rem.
  const remPixels = useRemPixels();
  const fixed = typeof width === 'number' ? width : undefined;
  const min = ownMin ?? 12;
  const max = Math.max(min, ownMax ?? (resizable || fixed !== undefined ? 32 : 20));
  // A remembered or controlled width stays within the bounds, which may have changed since.
  const wanted = resizable ? (state.width ?? fixed) : fixed;
  const chosen = wanted === undefined ? undefined : Math.min(max, Math.max(min, wanted));
  // A resizable sidebar fits its content, up to 20 rem, until people choose a width.
  const contentMax = chosen === undefined ? Math.min(max, Math.max(min, 20)) : max;
  const [resizing, setResizing] = useState(false);
  const [natural, setNatural] = useState<number>();
  useLayoutEffect(() => {
    const panel = node?.firstElementChild as HTMLElement | null | undefined;
    if (!resizable || chosen !== undefined || !panel || typeof ResizeObserver === 'undefined')
      return;
    const observer = new ResizeObserver(() => {
      // The width a drag starts from: the docked panel's, not a rail's.
      if (panel.parentElement?.getAttribute('data-state') !== 'expanded') return;
      setNatural(panel.offsetWidth);
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, [resizable, chosen, node]);
  const value = chosen !== undefined ? chosen * remPixels : (natural ?? min * remPixels);

  const handleScope = useMemo<HandleScope>(
    () => ({
      side,
      id,
      resizable,
      collapsed,
      value,
      min: min * remPixels,
      max: max * remPixels,
      remPixels,
      label: resizeLabel ?? messages.resizeSidebar,
      setWidth: (pixels, committed) => store.setWidth(side, pixels / remPixels, committed),
      toggle: () =>
        state.canDock ? store.setOpen(side, !state.open, 'handle') : store.toggle(side, 'handle'),
      setResizing,
    }),
    [
      side,
      id,
      resizable,
      collapsed,
      value,
      min,
      max,
      remPixels,
      resizeLabel,
      messages,
      store,
      state,
    ],
  );

  // Where focus goes when the sidebar hides what holds it: to the sidebar's trigger, else Main.
  // The focused element is read as the change renders too, since some engines, such as WebKit, drop
  // focus from content that turns inert before the layout effects run.
  const focusedBefore = useRef<HTMLElement | null>(null);
  if (typeof document !== 'undefined') {
    const active = element.current?.ownerDocument.activeElement as HTMLElement | null | undefined;
    focusedBefore.current = active && element.current?.contains(active) ? active : null;
  }
  useLayoutEffect(() => {
    const root = element.current;
    if (!root || isMobile || !collapsed || shown) return;
    const page = root.ownerDocument;
    const active = page.activeElement as HTMLElement | null;
    const dropped = (!active || active === page.body) && focusedBefore.current;
    const focused = dropped ? focusedBefore.current : active;
    if (!focused || !root.contains(focused) || focused === root) return;
    const visible = (node: Element) =>
      typeof (node as HTMLElement).checkVisibility === 'function'
        ? (node as HTMLElement).checkVisibility({ visibilityProperty: true })
        : true;
    if (!outOfView && visible(focused)) return;
    const triggers = Array.from(page.querySelectorAll<HTMLElement>(`[aria-controls="${id}"]`));
    const trigger = triggers.find(
      (each) => !each.hidden && (!outOfView || !root.contains(each)) && visible(each),
    );
    const main = page.getElementById(store.mainId);
    const target = trigger ?? main;
    if (target) target.focus({ preventScroll: true });
    else focused.blur();
  }, [collapsed, shown, outOfView, isMobile, id, store.mainId]);

  // The window widening past the breakpoint closes the drawer: the control that had focus in it
  // takes focus in the inline sidebar, else Main.
  const drawerFocus = useRef<number | undefined>(undefined);
  const wasMobile = useRef(isMobile);
  const wasOpen = useRef(state.openMobile);
  useLayoutEffect(() => {
    const widened = wasMobile.current && !isMobile && wasOpen.current;
    wasMobile.current = isMobile;
    wasOpen.current = state.openMobile;
    if (!widened) return;
    const index = drawerFocus.current;
    drawerFocus.current = undefined;
    if (index === undefined) return;
    const root = element.current;
    const page = root?.ownerDocument ?? document;
    // After the drawer hands focus back to what opened it; the drawer's closing, which follows at
    // once, doesn't cancel it.
    requestAnimationFrame(() => {
      const control = root?.querySelectorAll<HTMLElement>(tabbable)[index];
      const target =
        control && control.checkVisibility?.({ visibilityProperty: true }) !== false
          ? control
          : page.getElementById(store.mainId);
      if (target?.isConnected) target.focus();
    });
  }, [isMobile, state.openMobile, store.mainId]);
  if (!state.openMobile) drawerFocus.current = undefined;

  const scope = useMemo<SidebarScope>(
    () => ({ side, id, label, collapsible, inDrawer: isMobile, registerTrigger }),
    [side, id, label, collapsible, isMobile, registerTrigger],
  );
  // A frame rendered as a preview inside another page has no landmarks of its own.
  const shape = useContext(FrameShapeContext);
  const role = shape && !shape.landmarks ? 'none' : landmark;
  const Landmark = role === 'navigation' ? 'nav' : role === 'complementary' ? 'aside' : 'div';
  const sizes = {
    '--env-sidebar-chosen-width': chosen !== undefined ? `${chosen}rem` : undefined,
    '--env-sidebar-min-width': `${min}rem`,
    '--env-sidebar-max-width': `${contentMax}rem`,
  } as CSSProperties;
  const triggerStyle = (
    <TriggerStyle
      ids={id === store.sideIds[side] ? [id] : [id, store.sideIds[side]]}
      breakpoint={store.breakpoint}
      collapsible={collapsible}
      mobile={mobile}
    />
  );
  // A Sidebar.Root in the sidebar's content is none of the frame's regions.
  const content = <FrameSlotContext value={false}>{children}</FrameSlotContext>;

  if (isMobile) {
    if (mobile === 'none') return triggerStyle;
    return (
      <SidebarScopeContext value={scope}>
        {triggerStyle}
        <InSidebarContext value>
          <SidebarRailContext value={false}>
            <SidebarDrawer
              store={store}
              side={side}
              id={id}
              label={label}
              landmark={Landmark}
              width={chosen}
              ownTrigger={triggers > 0}
              closeOnNavigate={closeOnNavigate}
              onFocusIndex={(index) => {
                drawerFocus.current = index;
              }}
              className={className}
              style={style}
            >
              {content}
            </SidebarDrawer>
          </SidebarRailContext>
        </InSidebarContext>
      </SidebarScopeContext>
    );
  }

  return (
    <SidebarScopeContext value={scope}>
      {triggerStyle}
      <InSidebarContext value>
        <SidebarRailContext value={api.isRail}>
          <HandleContext value={handleScope}>
            <Landmark
              {...rest}
              ref={attach}
              id={id}
              aria-label={Landmark === 'div' ? rest['aria-label'] : label}
              className={classNames('env-sidebar', className)}
              style={{ ...sizes, ...style }}
              inert={outOfView || undefined}
              data-side={side}
              data-state={collapsed ? 'collapsed' : 'expanded'}
              data-collapsible={collapsible}
              data-rail={api.isRail ? '' : undefined}
              data-peek={shown ? '' : undefined}
              data-held={shown && state.held ? '' : undefined}
              data-popup-held={popupOpen ? '' : undefined}
              data-frame={store.inShell ? '' : undefined}
              data-region={region}
              data-breakpoint={store.breakpoint}
              data-dock-at={docksLater(dockAt, store.breakpoint) ? dockAt : undefined}
              data-width={chosen !== undefined ? 'fixed' : 'content'}
              data-resizing={resizing ? '' : undefined}
              data-ready={store.ready ? '' : undefined}
            >
              <div className="env-sidebar-panel">
                {content}
                {resizable && !hasHandle(children, handlePart) && renderHandle()}
              </div>
            </Landmark>
          </HandleContext>
        </SidebarRailContext>
      </InSidebarContext>
    </SidebarScopeContext>
  );
}
