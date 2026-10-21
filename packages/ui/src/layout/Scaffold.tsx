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
import { useMessages } from '../internal/EnvUIContext.js';
import { setRef } from '../internal/setRef.js';
import { useScrollKeys } from './internal/useScrollKeys.js';

/**
 * One of the three ways an application's destinations show: a Bar at the bottom, a Rail at the
 * start or a Drawer at the start.
 */
export type NavigationForm = 'bar' | 'rail' | 'drawer';

/** The navigation forms an application gives a Scaffold, each the component that renders it. */
export interface ScaffoldNavigation {
  /** The navigation Bar, at the bottom of a compact window. */
  bar?: ReactNode;
  /** The navigation Rail, at the start of a medium window. */
  rail?: ReactNode;
  /** The navigation Drawer, at the start of an expanded or a large window. */
  drawer?: ReactNode;
}

/**
 * Which navigation form shows at each window class, or none. A window class left out keeps its
 * default: bar on compact, rail on medium, drawer on expanded and large.
 */
export type ScaffoldForms = Partial<Record<WindowClass, NavigationForm | 'none'>>;

export interface ScaffoldProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The top bar region, above the body: usually a TopBar. */
  topBar?: ReactNode;
  /**
   * The navigation forms, such as `{ bar: <Bar … />, rail: <Rail … />, drawer: <Drawer … /> }`
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
  forms?: ScaffoldForms;
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
  skipLabel?: string;
  /**
   * The name of the skip link to the navigation.
   * @default 'Skip to navigation', or EnvUIProvider's messages.scaffold.skipToNavigation
   */
  skipNavigationLabel?: string;
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

/** The window classes, smallest first. */
const classes = ['compact', 'medium', 'expanded', 'large'] as const;

const defaultForms: Record<WindowClass, NavigationForm> = {
  compact: 'bar',
  medium: 'rail',
  expanded: 'drawer',
  large: 'drawer',
};

/** The forms that stand in for one that wasn't given, nearest first. */
const standIns: Record<NavigationForm, readonly NavigationForm[]> = {
  bar: ['bar', 'rail', 'drawer'],
  rail: ['rail', 'drawer', 'bar'],
  drawer: ['drawer', 'rail', 'bar'],
};

/**
 * The form that shows at each window class: the one asked for, else the nearest one given, else
 * none. Worked out from the props alone, so the server's markup has it, and CSS shows it at its
 * width.
 */
export function resolveNavigationForms(
  navigation: ScaffoldNavigation | undefined,
  forms: ScaffoldForms | undefined,
): Record<WindowClass, NavigationForm | 'none'> {
  const given = (form: NavigationForm) => navigation?.[form] != null;
  const resolved = {} as Record<WindowClass, NavigationForm | 'none'>;
  for (const windowClass of classes) {
    const asked = forms?.[windowClass] ?? defaultForms[windowClass];
    resolved[windowClass] =
      asked === 'none' ? 'none' : (standIns[asked].find(given) ?? ('none' as const));
  }
  return resolved;
}

/** The element of a navigation form to put focus on: its current item, else its first one. */
function entryOf(form: HTMLElement) {
  const focusable = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const current = form.querySelector<HTMLElement>('[aria-current]:not([aria-current="false"])');
  return (
    (current?.matches(focusable) ? current : current?.querySelector<HTMLElement>(focusable)) ??
    form.querySelector<HTMLElement>(focusable)
  );
}

/** Whether a navigation form's slot shows at the Scaffold's width, as CSS decided. */
const showing = (slot: Element) => getComputedStyle(slot).display !== 'none';

/** Moves focus to a region without scrolling it under the top bar, as a skip link does. */
function focusRegion(target: HTMLElement) {
  // A region that takes no focus takes it for as long as it keeps it, so a press inside it later
  // doesn't focus the region itself.
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
  target.focus();
}

/**
 * The invisible structure of an application's screen, after Material's: a top bar region, a
 * navigation region and the body. It never paints. It shows one navigation form at a time by its
 * own width, CSS only: a Bar at the bottom of a compact window, a Rail at the start of a medium one
 * and a Drawer at the start from expanded. The document scrolls by default, with the top bar, the
 * bar and the rail or the drawer kept in view; `scroll="body"` scrolls the body alone. Skip links
 * to the body and the navigation come first.
 */
export function Scaffold({
  topBar,
  navigation,
  forms,
  topBarSpan = 'body',
  scroll = 'document',
  bodyId,
  bodyRef,
  skipLabel,
  skipNavigationLabel,
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

  const resolved = resolveNavigationForms(navigation, forms);
  const shown = new Set(Object.values(resolved));
  const hasNavigation = shown.has('bar') || shown.has('rail') || shown.has('drawer');

  // When the Scaffold's width changes the form that shows, focus in the form that hid goes to the
  // form that shows now, on its current item. Focus elsewhere stays where it is.
  useEffect(() => {
    if (!root || !hasNavigation) return;
    const document = root.ownerDocument;
    const region = () => document.getElementById(navigationId);
    // The slot of the form that last had focus, until focus or a press goes elsewhere.
    let focused: HTMLElement | null = null;
    const slotOf = (node: EventTarget | null) => {
      const slot =
        node instanceof Element ? node.closest<HTMLElement>('[data-navigation-form]') : null;
      return slot && slot.parentElement === region() ? slot : null;
    };
    const onFocusIn = (event: FocusEvent) => {
      focused = slotOf(event.target);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !focused?.contains(event.target)) focused = null;
    };
    const observer = new ResizeObserver(() => {
      if (!focused || showing(focused)) return;
      const active = document.activeElement;
      // Focus that moved on, rather than left with the form as it hid, stays where it is.
      if (active && active !== document.body && !focused.contains(active)) {
        focused = null;
        return;
      }
      const next = [...(region()?.children ?? [])].find(
        (slot): slot is HTMLElement => slot instanceof HTMLElement && showing(slot),
      );
      focused = next ?? null;
      if (!next) return;
      const entry = entryOf(next);
      if (entry) entry.focus();
      else focusRegion(next);
    });
    root.addEventListener('focusin', onFocusIn);
    document.addEventListener('pointerdown', onPointerDown, true);
    observer.observe(root);
    return () => {
      root.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('pointerdown', onPointerDown, true);
      observer.disconnect();
    };
  }, [root, hasNavigation, navigationId]);
  // Every form that shows at some window class is rendered; CSS shows the one for the Scaffold's
  // width, and the others are display: none, out of the tab order and the accessibility tree.
  const slot = (form: NavigationForm) =>
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
      data-compact={resolved.compact}
      data-medium={resolved.medium}
      data-expanded={resolved.expanded}
      data-large={resolved.large}
    >
      {landmarks && (
        <div className="env-scaffold-skip-links">
          <Button
            href={`#${mainId}`}
            variant="secondary"
            className="env-scaffold-skip-link"
            onClick={skipToBody}
          >
            {skipLabel ?? messages.skipToContent}
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
              {skipNavigationLabel ?? messages.skipToNavigation}
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
