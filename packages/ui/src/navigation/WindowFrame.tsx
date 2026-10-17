'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { useScrollKeys } from './internal/useScrollKeys.js';
import { TitleBarControls, titleBarClassName } from './internal/TitleBarFrame.js';
import { AppShellContext, readFrameLength } from './app-shell/useAppShell.js';

/** Root hands the scrolling element to the scroll keys; Content attaches it. */
const ScrollerContext = createContext<((element: HTMLDivElement | null) => void) | null>(null);

export interface RootProps extends ComponentPropsWithRef<'div'> {
  /** The window's parts: a WindowFrame.TitleBar on top, then WindowFrame.Content. */
  children?: ReactNode;
}

/**
 * A window without the application shell, such as a start page: it fills the window with its title
 * bar on top and its content scrolling below it, so the window controls drawn over the title bar
 * never cover a scrollbar. The keyboard scrolls the content as it would the document. It publishes
 * the title bar's size as --env-frame-header-block-size and --env-frame-sticky-top (0, the
 * content's top), and useAppShell inside it returns its content as the scrolling element.
 */
function Root({ children, className, ref, ...props }: RootProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  scrollerRef.current = scroller;
  useScrollKeys(root, scroller);
  const attachRoot = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      setRoot(node);
      setRef(ref, node);
    },
    [ref],
  );
  // useAppShell inside the window: its content scrolls, and sticky content sticks at its top.
  const getScrollElement = useCallback(
    () => scrollerRef.current,
    // The function changes as the content attaches, so effects that depend on it run again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scroller],
  );
  const frame = useMemo(
    () => ({
      getScrollElement,
      getStickyTop: () => readFrameLength(rootRef.current, '--env-frame-sticky-top'),
      scroll: 'main' as const,
    }),
    [getScrollElement],
  );
  return (
    <div {...props} ref={attachRoot} className={classNames('env-window-frame', className)}>
      <AppShellContext value={frame}>
        <ScrollerContext value={setScroller}>{children}</ScrollerContext>
      </AppShellContext>
    </div>
  );
}

export interface TitleBarProps extends Omit<ComponentPropsWithRef<'header'>, 'children'> {
  /** Content at the inline start, such as the application mark and a Menubar. */
  start?: ReactNode;
  /** Content centered in the bar, such as the document title. */
  children?: ReactNode;
  /** Content at the inline end, such as actions; the window controls follow it. */
  end?: ReactNode;
}

/**
 * A window title bar, for an installed web app or desktop shell that draws its own title bar: empty
 * space drags the window, it leaves room for the window controls the system draws, and the controls
 * inside are small, with buttons that set no variant ghost. It is a normal block, on its own or at
 * the top of WindowFrame.Root, which scrolls the content below it.
 */
function TitleBar({ start, end, children, className, ...props }: TitleBarProps) {
  return (
    <header
      {...props}
      className={classNames(titleBarClassName, 'env-window-frame-title-bar-layout', className)}
    >
      <TitleBarControls>
        <div className="env-window-frame-title-bar-start">{start}</div>
        <div className="env-window-frame-title-bar-center">{children}</div>
        <div className="env-window-frame-title-bar-end">{end}</div>
      </TitleBarControls>
    </header>
  );
}

export interface ContentProps extends ComponentPropsWithRef<'div'> {
  /** The window's content, which scrolls below the title bar. */
  children?: ReactNode;
}

/**
 * The window's content below the title bar, which scrolls on its own. Its ref is the scrolling
 * element, to read and restore scroll positions. Pressing it focuses it, so the keyboard scrolls it.
 */
function Content({ children, className, ref, ...props }: ContentProps) {
  const attachScroller = useContext(ScrollerContext);
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      attachScroller?.(node);
      setRef(ref, node);
    },
    [attachScroller, ref],
  );
  return (
    <div
      tabIndex={-1}
      {...props}
      ref={attach}
      className={classNames('env-window-frame-content', className)}
    >
      {children}
    </div>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'WindowFrame.Root');
const TitleBarPart = /* @__PURE__ */ withDisplayName(TitleBar, 'WindowFrame.TitleBar');
const ContentPart = /* @__PURE__ */ withDisplayName(Content, 'WindowFrame.Content');
export { RootPart as Root, TitleBarPart as TitleBar, ContentPart as Content };
