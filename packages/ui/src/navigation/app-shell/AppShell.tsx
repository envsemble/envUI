'use client';

import {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Button } from '../../actions/Button.js';
import { LoadingBar } from '../../feedback/internal/LoadingBar.js';
import { appShell } from '../../foundations/messages/appShell.js';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { setRef } from '../../internal/setRef.js';
import { withDisplayName } from '../../internal/withDisplayName.js';
import { useScrollKeys } from '../internal/useScrollKeys.js';
import { SidebarRegion, type SidebarProps } from '../sidebar/SidebarRegion.js';
import { Handle } from '../sidebar/Sidebar.js';
import {
  defaultMainId,
  FrameProvider,
  FrameShapeContext,
  useFrameState,
  useFrameStore,
  type FrameShape,
  type FrameStateProps,
} from './FrameStore.js';
import { AppShellContext, readFrameLength } from './useAppShell.js';
import { useFrameMetrics } from './useFrameMetrics.js';

export interface RootProps extends FrameStateProps, Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * main: the sidebars run the full height and the header sits beside them. full: the header runs
   * across the window and the sidebars sit below it.
   * @default 'main'
   */
  headerSpan?: 'main' | 'full';
  /**
   * document: the document scrolls under a sticky header. main: the frame fills its container
   * (100dvh, or --env-app-shell-block-size) and AppShell.Main scrolls, with the keyboard
   * scrolling it as it would the document.
   * @default 'document'
   */
  scroll?: 'document' | 'main';
  /**
   * Hairlines between the header, the sidebars and the content.
   * @default true
   */
  dividers?: boolean;
  /** Shows page progress along the header's bottom edge, such as while the next page loads. */
  loading?: boolean;
  /**
   * The progress bar's name.
   * @default 'Loading page', or EnvUIProvider's messages.appShell.loadingPage
   */
  loadingLabel?: string;
  /**
   * false renders the parts without landmark roles, for a preview of a frame inside another
   * page's main content.
   * @default true
   */
  landmarks?: boolean;
  /** The frame's parts: AppShell.SkipLinks, Sidebar.Root, AppShell.Header, AppShell.Main, AppShell.Aside. */
  children: ReactNode;
}

/**
 * The application frame: a header, sidebars at the start and end, the main content and an aside,
 * laid out in a grid that follows the text direction. It keeps the sidebars' state, remembers it
 * with persist, turns the sidebars into drawers below its breakpoint, and publishes the header's
 * size as --env-frame-header-block-size and where sticky content sticks as
 * --env-frame-sticky-top.
 */
function Root({
  headerSpan = 'main',
  scroll = 'document',
  dividers = true,
  loading = false,
  loadingLabel,
  landmarks = true,
  defaultSidebarOpen,
  sidebarOpen,
  onSidebarOpenChange,
  defaultSidebarWidth,
  sidebarWidth,
  onSidebarWidthChange,
  persist,
  initialState,
  breakpoint,
  shortcut,
  className,
  ref,
  children,
  ...props
}: RootProps) {
  const messages = useMessages('appShell', appShell);
  const store = useFrameState(
    {
      defaultSidebarOpen,
      sidebarOpen,
      onSidebarOpenChange,
      defaultSidebarWidth,
      sidebarWidth,
      onSidebarWidthChange,
      persist,
      initialState,
      breakpoint,
      shortcut,
    },
    true,
  );
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [header, setHeader] = useState<HTMLElement | null>(null);
  const [main, setMain] = useState<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  mainRef.current = main;
  const attachRoot = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      setRoot(node);
      setRef(ref, node);
    },
    [ref],
  );
  // With the document no longer scrolling, the keyboard scrolls Main as it would the document.
  useScrollKeys(scroll === 'main' ? root : null, scroll === 'main' ? main : null);
  useFrameMetrics(scroll === 'document' ? header : null);

  // The function reads the elements as it is called, so a copy kept from an earlier render returns
  // them too; it changes as they attach, so effects that depend on it run again.
  const getScrollElement = useCallback((): HTMLElement | null => {
    if (scroll === 'main') return mainRef.current;
    const page =
      rootRef.current?.ownerDocument ?? (typeof document === 'undefined' ? null : document);
    if (!page) return null;
    return (page.scrollingElement as HTMLElement | null) ?? page.documentElement;
    // The elements are listed on purpose, so the function changes as they attach.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroll, main, root]);
  const getStickyTop = useCallback(
    () => readFrameLength(rootRef.current, '--env-frame-sticky-top'),
    [],
  );
  const context = useMemo(
    () => ({ getScrollElement, getStickyTop, scroll }),
    [getScrollElement, getStickyTop, scroll],
  );
  const shape = useMemo<FrameShape>(
    () => ({ landmarks, scroll, headerSpan, titleBar: false, setHeader, setMain }),
    [landmarks, scroll, headerSpan],
  );
  return (
    <FrameProvider value={store}>
      <AppShellContext value={context}>
        <FrameShapeContext value={shape}>
          <div
            {...props}
            ref={attachRoot}
            className={classNames('env-app-shell', className)}
            data-header-span={headerSpan}
            data-scroll={scroll}
            data-dividers={dividers ? '' : undefined}
            data-breakpoint={store.breakpoint}
            data-mobile={store.isMobile ? '' : undefined}
            data-ready={store.ready ? '' : undefined}
            data-loading={loading ? '' : undefined}
            data-end={store.sides.end.registration?.region}
          >
            {children}
            <LoadingBar
              active={loading}
              label={loadingLabel ?? messages.loadingPage}
              contained
              className="env-app-shell-loading-bar"
            />
          </div>
        </FrameShapeContext>
      </AppShellContext>
    </FrameProvider>
  );
}

export interface SkipLinksProps extends ComponentPropsWithRef<'div'> {
  /** Extra targets after the generated ones, such as a search field. */
  links?: { href: string; label: string }[];
}

/** Moves focus to an element on the page without scrolling it under the header. */
function skipTo(event: MouseEvent<HTMLElement>, href: string) {
  if (!href.startsWith('#')) return;
  const page = event.currentTarget.ownerDocument;
  const target = page.getElementById(decodeURIComponent(href.slice(1)));
  if (!target) return;
  event.preventDefault();
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  // The document's scroll padding, or Main's own scrolling, keeps it below the header.
  target.focus();
}

/**
 * Links before everything else that move keyboard focus past the frame: Skip to content (Main),
 * then Skip to each sidebar that is in reach now, then `links`. Hidden until focused; the first
 * tab stop of the page. Outside AppShell.Root it renders only `links`.
 */
function SkipLinks({ links = [], className, ...props }: SkipLinksProps) {
  const store = useFrameStore();
  const messages = useMessages('appShell', appShell);
  const targets: { href: string; label: string }[] = [];
  if (store?.inShell) {
    targets.push({ href: `#${store.mainId}`, label: store.mainLabel ?? messages.skipToContent });
    if (!store.isMobile)
      for (const side of ['start', 'end'] as const) {
        const { registration, open, canDock, peek, held } = store.sides[side];
        if (!registration) continue;
        // A sidebar out of view can't take focus.
        const outOfView =
          registration.collapsible === 'offcanvas' && !(open && canDock) && !peek && !held;
        if (!outOfView)
          targets.push({
            href: `#${registration.id}`,
            label: messages.skipTo({ label: registration.label }),
          });
      }
  }
  targets.push(...links);
  return (
    <div {...props} className={classNames('env-app-shell-skip-links', className)}>
      {targets.map((target) => (
        <Button
          key={target.href}
          href={target.href}
          variant="secondary"
          className="env-app-shell-skip-link"
          onClick={(event) => skipTo(event, target.href)}
        >
          {target.label}
        </Button>
      ))}
    </div>
  );
}

export interface HeaderProps extends Omit<ComponentPropsWithRef<'header'>, 'children'> {
  /** Content at the inline start, such as a SidebarTrigger and the application's mark. */
  start?: ReactNode;
  /** The title area, such as the page's name: it truncates first, and hides below the breakpoint. */
  children?: ReactNode;
  /** Actions at the inline end, such as a ThemeToggle and an AccountMenu. */
  end?: ReactNode;
  /**
   * Only below the frame's breakpoint, where the sidebars are drawers: a phone's top bar with the
   * triggers that open them.
   * @default false
   */
  mobileOnly?: boolean;
}

/**
 * The frame's header: one row that never wraps, with start content, a title that truncates first,
 * and actions at the end. It is the banner landmark, sticky while the document scrolls, and its
 * fixed height (--env-app-shell-header-height) is the frame's published header size.
 */
function Header({
  start,
  end,
  children,
  mobileOnly = false,
  className,
  ref,
  ...props
}: HeaderProps) {
  const shape = useContext(FrameShapeContext);
  const setHeader = shape?.setHeader;
  const attach = useCallback(
    (node: HTMLElement | null) => {
      setHeader?.(node);
      setRef(ref, node);
    },
    [ref, setHeader],
  );
  const Element = shape && !shape.landmarks ? 'div' : 'header';
  return (
    <Element
      {...props}
      ref={attach}
      className={classNames('env-app-shell-header', className)}
      data-mobile-only={mobileOnly ? '' : undefined}
    >
      {start != null && <div className="env-app-shell-header-start">{start}</div>}
      <div className="env-app-shell-header-title">{children}</div>
      {end != null && <div className="env-app-shell-header-end">{end}</div>}
    </Element>
  );
}

export interface MainProps extends ComponentPropsWithRef<'main'> {
  /**
   * The skip link's name.
   * @default 'Skip to content', or EnvUIProvider's messages.appShell.skipToContent
   */
  skipLabel?: string;
}

/**
 * The page's main content: the main landmark, which skip links and a navigation in a drawer move
 * focus to. It has no padding of its own (Page has), and its inline size is a container for
 * container queries. With scroll="main" it is the region that scrolls.
 */
function Main({ id, skipLabel, className, ref, ...props }: MainProps) {
  const store = useFrameStore();
  const shape = useContext(FrameShapeContext);
  const mainId = id ?? defaultMainId;
  const setMainId = store?.setMainId;
  useLayoutEffect(() => {
    if (!setMainId) return;
    setMainId(mainId, skipLabel);
    return () => setMainId(defaultMainId);
  }, [setMainId, mainId, skipLabel]);
  const setMain = shape?.setMain;
  const attach = useCallback(
    (node: HTMLElement | null) => {
      setMain?.(node);
      setRef(ref, node);
    },
    [ref, setMain],
  );
  const Element = shape && !shape.landmarks ? 'div' : 'main';
  return (
    <Element
      tabIndex={-1}
      {...props}
      ref={attach}
      id={mainId}
      className={classNames('env-app-shell-main', className)}
    />
  );
}

export interface AsideProps
  extends Omit<
    SidebarProps,
    'side' | 'landmark' | 'collapsible' | 'dockAt' | 'peek' | 'peekDelay' | 'width'
  > {
  /** Names the complementary landmark and its drawer, such as Details. */
  label: string;
  /** The aside's content, such as an inspector. */
  children: ReactNode;
}

/**
 * The page's region at the end, such as an inspector or details: a complementary landmark beside
 * Main, below the header, that opens and closes (useSidebar('end')) and becomes an end drawer below
 * the breakpoint. A frame has an end Sidebar.Root or an AppShell.Aside, not both.
 */
function Aside({ minWidth = 16, maxWidth = 40, ...props }: AsideProps) {
  const shape = useContext(FrameShapeContext);
  return (
    <SidebarRegion
      {...props}
      side="end"
      collapsible="offcanvas"
      landmark={shape && !shape.landmarks ? 'none' : 'complementary'}
      minWidth={minWidth}
      maxWidth={maxWidth}
      region="aside"
      handlePart={Handle}
      renderHandle={() => <Handle />}
    />
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'AppShell.Root');
const SkipLinksPart = /* @__PURE__ */ withDisplayName(SkipLinks, 'AppShell.SkipLinks');
const HeaderPart = /* @__PURE__ */ withDisplayName(Header, 'AppShell.Header');
const MainPart = /* @__PURE__ */ withDisplayName(Main, 'AppShell.Main');
const AsidePart = /* @__PURE__ */ withDisplayName(Aside, 'AppShell.Aside');
export {
  RootPart as Root,
  SkipLinksPart as SkipLinks,
  HeaderPart as Header,
  MainPart as Main,
  AsidePart as Aside,
};
