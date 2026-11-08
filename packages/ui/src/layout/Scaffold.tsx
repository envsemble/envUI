'use client';

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { Button } from '../actions/Button.js';
import { scaffold } from '../foundations/messages/scaffold.js';
import type { WindowClass } from '../foundations/windowClasses.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { setRef } from '../internal/setRef.js';
import { useScrollKeys } from './internal/useScrollKeys.js';
import { resolveNavigationForms } from './internal/navigationForms.js';
import { focusRegion } from './internal/scaffoldFocus.js';
import { useNavigationFocusHandoff } from './internal/useNavigationFocusHandoff.js';
import '../styles/Base.css';
import '../styles/Scaffold.css';

/**
 * One of the three ways an application's destinations show: a NavigationBar at the bottom, a NavigationRail at the
 * start or a NavigationDrawer at the start.
 */
export type ScaffoldNavigationForm = 'bar' | 'rail' | 'drawer';

/** The navigation forms an application gives a Scaffold, each the component that renders it. */
export interface ScaffoldNavigation {
  /** The NavigationBar, at the bottom of a compact window. */
  bar?: ReactNode;
  /** The NavigationRail, at the start of a medium window. */
  rail?: ReactNode;
  /** The NavigationDrawer, at the start of an expanded or a large window. */
  drawer?: ReactNode;
}

/**
 * Which navigation form shows at each window class, or none. A window class left out keeps its
 * default: bar on compact, rail on medium, drawer on expanded and large.
 */
export type ScaffoldForms = Partial<Record<WindowClass, ScaffoldNavigationForm | 'none'>>;

export interface ScaffoldProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The top bar region, above the body: usually a TopBar. */
  topBar?: ReactNode;
  /**
   * The navigation forms, such as `{ bar: <NavigationBar … />, rail: <NavigationRail … />, drawer: <NavigationDrawer … /> }`
   * with the same destinations. One shows at a time, chosen by the Scaffold's own width; give only
   * the forms the application uses.
   */
  navigation?: ScaffoldNavigation;
  /**
   * Which form shows at each window class, or none, such as `{ compact: 'none' }` for an
   * application that opens its navigation from the top bar on a phone. Where the form a window
   * class asks for wasn't given, the nearest given form shows: a rail for a drawer and the other
   * way round, then the bar.
   * @default { compact: 'bar', medium: 'rail', expanded: 'drawer', large: 'drawer' }
   */
  navigationForms?: ScaffoldForms;
  /**
   * body: the top bar sits above the body, beside the rail or drawer, which run the full height.
   * full: the top bar runs across the whole width, above the navigation, as a window's title bar
   * must.
   * @default 'body'
   */
  topBarSpan?: 'body' | 'full';
  /**
   * What scrolls. document: the page, as on any website, so a phone collapses its address bar,
   * pull to refresh and a tap on the status bar work and the browser restores the scroll position;
   * the top bar and the bar stick to the window's edges and the rail or the drawer stays in view,
   * in a Scaffold at least as tall as the window. body: the body alone, under the top bar, in a
   * Scaffold that fills its container's height, 100dvh unless a class gives it another, with the
   * keyboard scrolling the body as it would the document: for a preview or an embedded frame, a
   * window with its own title bar, or a body of Panes whose panes scroll on their own.
   * @default 'document'
   */
  scroll?: 'document' | 'body';
  /**
   * The body's id, the target of the skip link to the content.
   * @default 'main', or an id of its own where `landmarks` is false
   */
  bodyId?: string;
  /**
   * The body's element: with `scroll="body"` the element that scrolls, to read or restore its
   * scroll position on.
   */
  bodyRef?: Ref<HTMLElement>;
  /**
   * The name of the skip link to the body.
   * @default 'Skip to content', or EnvUIProvider's messages.scaffold.skipToContent
   */
  skipToContentLabel?: string;
  /**
   * The name of the skip link to the navigation.
   * @default 'Skip to navigation', or EnvUIProvider's messages.scaffold.skipToNavigation
   */
  skipToNavigationLabel?: string;
  /**
   * false renders the regions without landmarks, a div for the banner and the main, and no skip
   * links, for a preview of an application inside another page's main content.
   * @default true
   */
  landmarks?: boolean;
  /**
   * A name for this node, such as "app", which dev mode and the docs show; it renders as
   * `data-env-name`.
   */
  name?: string;
  /** The body: the page's main content, usually a Page or Panes. */
  children?: ReactNode;
}

/**
 * The invisible structure of an application's screen, after Material's: a top bar region, a
 * navigation region and the body. It never paints. It shows one navigation form at a time by its
 * own width, CSS only: a NavigationBar at the bottom of a compact window, a NavigationRail at the start of a medium one
 * and a NavigationDrawer at the start from expanded. The document scrolls by default, with the top bar, the
 * bar and the rail or the drawer kept in view; `scroll="body"` scrolls the body alone. Skip links
 * to the body and the navigation come first.
 */
export function Scaffold({
  topBar,
  navigation,
  navigationForms,
  topBarSpan = 'body',
  scroll = 'document',
  bodyId,
  bodyRef,
  skipToContentLabel,
  skipToNavigationLabel,
  landmarks = true,
  name,
  className,
  ref,
  children,
  ...props
}: ScaffoldProps) {
  const messages = useMessages('scaffold', scaffold);
  const id = useId();
  const navigationId = `${id}-navigation`;
  const mainId = bodyId ?? (landmarks ? 'main' : `${id}-body`);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const attachRoot = useCallback(
    (node: HTMLDivElement | null) => {
      setRoot(node);
      setRef(ref, node);
    },
    [ref],
  );
  const attachBody = useCallback(
    (node: HTMLElement | null) => {
      setBody(node);
      setRef(bodyRef, node);
    },
    [bodyRef],
  );
  // Where the body scrolls rather than the document, the keyboard scrolls the body as it would the
  // document, also before anything in it has focus.
  useScrollKeys(scroll === 'body' ? root : null, body);

  const resolved = resolveNavigationForms(navigation, navigationForms);
  const shown = new Set(Object.values(resolved));
  const hasNavigation = shown.has('bar') || shown.has('rail') || shown.has('drawer');
  const hasTopBar = topBar != null;
  const hasBar = shown.has('bar');

  // The bars' heights, which CSS can't know where a top bar wraps or is a window's title bar, or
  // whatever a bar's labels take: the top bar's for what sticks under it, and, where the document
  // scrolls, both as the document's scroll padding, so what scrolls into view, such as an element
  // taking focus, keeps clear of the bars (WCAG 2.4.11). A bar that hides measures 0. Until script
  // runs, Scaffold.css estimates them.
  useEffect(
    function publishBarSizes() {
      if (!root || (!hasTopBar && !hasBar)) return;
      const html = root.ownerDocument.documentElement;
      const topBarRegion = root.querySelector<HTMLElement>(':scope > .env-scaffold-top-bar');
      const barSlot = root.querySelector<HTMLElement>(
        ':scope > .env-scaffold-navigation > .env-scaffold-bar',
      );
      const publish = () => {
        const top = topBarRegion?.offsetHeight ?? 0;
        root.style.setProperty('--env-scaffold-top-bar-size', `${top}px`);
        if (scroll !== 'document') return;
        html.style.setProperty('--env-scaffold-scroll-top', `${top}px`);
        html.style.setProperty('--env-scaffold-scroll-bottom', `${barSlot?.offsetHeight ?? 0}px`);
      };
      publish();
      const observer = new ResizeObserver(publish);
      for (const region of [topBarRegion, barSlot]) if (region) observer.observe(region);
      return () => {
        observer.disconnect();
        root.style.removeProperty('--env-scaffold-top-bar-size');
        html.style.removeProperty('--env-scaffold-scroll-top');
        html.style.removeProperty('--env-scaffold-scroll-bottom');
      };
    },
    [root, scroll, hasTopBar, hasBar],
  );
  useNavigationFocusHandoff(root, hasNavigation, navigationId);
  // Every form that shows at some window class is rendered; CSS shows the one for the Scaffold's
  // width, and the others are display: none, out of the tab order and the accessibility tree.
  const slot = (form: ScaffoldNavigationForm) =>
    shown.has(form) ? (
      <div className={`env-scaffold-${form}`} data-navigation-form={form}>
        {navigation?.[form]}
      </div>
    ) : null;

  const skipToNavigation = (event: MouseEvent<HTMLElement>) => {
    const region = root?.querySelector<HTMLElement>(`[id="${CSS.escape(navigationId)}"]`);
    // The form that shows is the one with a box.
    const form = [...(region?.children ?? [])].find(
      (child): child is HTMLElement => child instanceof HTMLElement && child.offsetParent !== null,
    );
    if (!form) return;
    event.preventDefault();
    focusRegion(form);
  };
  const skipToBody = (event: MouseEvent<HTMLElement>) => {
    if (!body) return;
    event.preventDefault();
    focusRegion(body);
  };

  const Banner = landmarks ? 'header' : 'div';
  const Main = landmarks ? 'main' : 'div';
  return (
    <div
      {...props}
      ref={attachRoot}
      className={classNames('env-scaffold', className)}
      data-env-layout="scaffold"
      data-env-name={name}
      data-top-bar-span={topBarSpan}
      data-scroll={scroll}
      data-navigation-compact={resolved.compact}
      data-navigation-medium={resolved.medium}
      data-navigation-expanded={resolved.expanded}
      data-navigation-large={resolved.large}
    >
      {landmarks && (
        <div className="env-scaffold-skip-links">
          <Button
            href={`#${mainId}`}
            variant="secondary"
            className="env-scaffold-skip-link"
            onClick={skipToBody}
          >
            {skipToContentLabel ?? messages.skipToContent}
          </Button>
          {hasNavigation && (
            // Hidden where the Scaffold's width shows no navigation form.
            <Button
              href={`#${navigationId}`}
              variant="secondary"
              className="env-scaffold-skip-link"
              data-skip="navigation"
              onClick={skipToNavigation}
            >
              {skipToNavigationLabel ?? messages.skipToNavigation}
            </Button>
          )}
        </div>
      )}
      {topBar != null && <Banner className="env-scaffold-top-bar">{topBar}</Banner>}
      {hasNavigation && (
        <div id={navigationId} className="env-scaffold-navigation">
          {slot('drawer')}
          {slot('rail')}
          {slot('bar')}
        </div>
      )}
      <Main ref={attachBody} id={mainId} tabIndex={-1} className="env-scaffold-body">
        {children}
      </Main>
    </div>
  );
}
