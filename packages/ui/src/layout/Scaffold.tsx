'use client';

import {
  useCallback,
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
   * The body's id, the target of the skip link to the content.
   * @default 'main'
   */
  bodyId?: string;
  /**
   * The body's element, which scrolls: read or restore its scroll position on it.
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
   * false renders the regions without landmarks, a div for the banner and the main, for a preview
   * of an application inside another page's main content.
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
 * and a Drawer at the start from expanded. It fills its container's height, 100dvh by default,
 * and the body scrolls under the top bar, with the keyboard scrolling it as it would the document.
 * Skip links to the body and the navigation come first.
 */
export function Scaffold({
  topBar,
  navigation,
  forms,
  topBarSpan = 'body',
  bodyId = 'main',
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
  const navigationId = `${useId()}-navigation`;
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
  // The body scrolls rather than the document, so the keyboard scrolls the body as it would the
  // document, also before anything in it has focus.
  useScrollKeys(root, body);

  const resolved = resolveNavigationForms(navigation, forms);
  const shown = new Set(Object.values(resolved));
  const hasNavigation = shown.has('bar') || shown.has('rail') || shown.has('drawer');
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
      data-compact={resolved.compact}
      data-medium={resolved.medium}
      data-expanded={resolved.expanded}
      data-large={resolved.large}
    >
      <div className="env-scaffold-skip-links">
        <Button
          href={`#${bodyId}`}
          variant="secondary"
          className="env-scaffold-skip-link"
          onClick={skipToBody}
        >
          {skipLabel ?? messages.skipToContent}
        </Button>
        {hasNavigation && (
          <Button
            href={`#${navigationId}`}
            variant="secondary"
            className="env-scaffold-skip-link"
            onClick={skipToNavigation}
          >
            {skipNavigationLabel ?? messages.skipToNavigation}
          </Button>
        )}
      </div>
      {topBar != null && <Banner className="env-scaffold-top-bar">{topBar}</Banner>}
      {hasNavigation && (
        <div id={navigationId} className="env-scaffold-navigation">
          {slot('drawer')}
          {slot('rail')}
          {slot('bar')}
        </div>
      )}
      <Main ref={attachBody} id={bodyId} tabIndex={-1} className="env-scaffold-body">
        {children}
      </Main>
    </div>
  );
}
