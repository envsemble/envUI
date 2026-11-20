'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type MouseEvent,
  type RefObject,
} from 'react';
import { ActionElement } from '../internal/control/ActionElement.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { tableOfContents } from '../foundations/messages/tableOfContents.js';
import {
  currentSection,
  readingPosition,
  flatten,
  type TableOfContentsItem,
} from './internal/tableOfContents/contentsOutline.js';
import {
  focusSection,
  readSections,
  rememberScroll,
} from './internal/tableOfContents/sectionScroll.js';
import { useContentsHeadings } from './internal/tableOfContents/useContentsHeadings.js';
import { createWaveDrawer } from './internal/tableOfContents/waveDrawer.js';
import { prefersReducedMotion, reducedMotionQuery } from '../internal/motion/reducedMotion.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import { flag } from '../internal/flag.js';
import { useLatest } from '../internal/useLatest.js';
import '../styles/Base.css';
import '../styles/TableOfContents.css';

export type { TableOfContentsItem } from './internal/tableOfContents/contentsOutline.js';

export interface TableOfContentsProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  /**
   * The sections to list, nested through `children`, each leading to the element with its `id`:
   * a heading or any other part of the page, under a label of your own. Without it, the component
   * lists the headings it finds in `container`, after it mounts.
   */
  items?: readonly TableOfContentsItem[];
  /**
   * Where to find the headings, without `items`: an element's ref or a CSS selector.
   * @default The page's `main` element, or the body without one
   */
  container?: RefObject<HTMLElement | null> | string;
  /**
   * The heading levels to list, without `items`. A heading nests under the one above it of a lower
   * level. A heading without an id gets one from its words.
   * @default [2, 3]
   */
  levels?: readonly HeadingLevel[];
  /** Leaves out the headings it returns false for, without `items`, such as an example's own. */
  filter?: (heading: HTMLElement) => boolean;
  /**
   * Called when people follow a link, with its section's id and the click, before envUI scrolls the
   * section into view and focuses it. Each link is an `#id` link through LinkProvider's link
   * component, so the application's router, or else the browser, changes the address. Call
   * preventDefault to make the jump yourself, without envUI's scroll or the address change.
   */
  onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /**
   * The accessible name of the navigation landmark.
   * @default 'On this page', or EnvUIProvider's messages.tableOfContents.label
   */
  'aria-label'?: string;
  /** Classes for the `nav` element. */
  className?: string;
}

const defaultLevels: readonly HeadingLevel[] = [2, 3];

const scrollPauseThatEndsLinkScrollMs = 150;

interface ListProps {
  items: readonly TableOfContentsItem[];
  current: string | undefined;
  passed: ReadonlySet<string>;
  depth: number;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
}

function List({ items, current, passed, depth, onNavigate }: ListProps) {
  return (
    <ol
      className="env-table-of-contents-list"
      style={depth > 0 ? { '--env-table-of-contents-depth': depth } : undefined}
    >
      {items.map((item) => (
        <li key={item.id} className="env-table-of-contents-item">
          <ActionElement
            className="env-table-of-contents-link"
            href={`#${item.id}`}
            aria-current={item.id === current ? 'location' : undefined}
            data-passed={flag(passed.has(item.id))}
            onClick={(event) => onNavigate(event, item.id)}
          >
            {item.label}
          </ActionElement>
          {item.children && item.children.length > 0 && (
            <List
              items={item.children}
              current={current}
              passed={passed}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * The page's sections as links, nested by level, with the one the reader is in marked as they
 * scroll: the headings in a container by default, or sections of your own.
 */
export function TableOfContents({
  items: givenItems,
  container,
  levels = defaultLevels,
  filter,
  onNavigate,
  'aria-label': label,
  className,
  ...props
}: TableOfContentsProps) {
  const messages = useMessages('tableOfContents', tableOfContents);
  const root = useRef<HTMLDivElement>(null);
  const shape = useRef<SVGSVGElement>(null);
  const items = useContentsHeadings({ givenItems, container, levels, filter, own: root });
  const [current, setCurrent] = useState<string>();
  const chosenByLink = useRef<{ id: string; settled: boolean } | null>(null);
  const settle = useRef(0);
  const scrollFrame = useRef(0);
  const latestOnNavigate = useLatest(onNavigate);
  const measureOnNextFrame = useRef<() => void>(() => {});
  const settleLater = useCallback((delay: number) => {
    clearTimeout(settle.current);
    const choice = chosenByLink.current;
    if (!choice) return;
    settle.current = window.setTimeout(() => {
      choice.settled = true;
      measureOnNextFrame.current();
    }, delay);
  }, []);
  useEffect(
    () => () => {
      clearTimeout(settle.current);
      cancelAnimationFrame(scrollFrame.current);
    },
    [],
  );
  const flat = useMemo(() => flatten(items), [items]);
  const ids = flat.map((entry) => entry.id).join('\n');

  useEffect(
    function trackCurrentSectionAndDrawReadersPlace() {
      if (ids === '') {
        setCurrent(undefined);
        return;
      }
      const sectionIds = ids.split('\n');
      const first = document.getElementById(sectionIds[0]);
      const doc = first?.ownerDocument ?? document;
      let frame = 0;

      const drawer = createWaveDrawer(
        () => root.current,
        () => shape.current,
        reducedMotionQuery(),
      );
      const update = () => {
        frame = 0;
        const choice = chosenByLink.current;
        if (choice?.settled) {
          setCurrent(choice.id);
          drawer.wave(sectionIds.indexOf(choice.id));
          return;
        }
        const elements = sectionIds
          .map((id) => doc.getElementById(id))
          .filter((element): element is HTMLElement => element !== null);
        if (elements.length === 0) {
          setCurrent(undefined);
          drawer.wave(null);
          return;
        }
        const { sections, view } = readSections(elements, doc);
        let next = currentSection(sections, view);
        let position = readingPosition(sections, view);
        if (choice) {
          const chosenIndex = sectionIds.indexOf(choice.id);
          if (position > chosenIndex) position = chosenIndex;
          if (next && sectionIds.indexOf(next) > chosenIndex) next = choice.id;
        }
        setCurrent(next);
        drawer.wave(position);
      };
      const schedule = () => {
        if (frame === 0) frame = requestAnimationFrame(update);
      };
      const onScroll = (event: Event) => {
        const target = event.target;
        const sectionLookedUpAfresh = doc.getElementById(sectionIds[0]);
        const movesNoSection =
          target instanceof Element &&
          sectionLookedUpAfresh &&
          !target.contains(sectionLookedUpAfresh);
        if (movesNoSection) return;
        const choice = chosenByLink.current;
        const scrollALinkStarted = choice && !choice.settled;
        if (scrollALinkStarted) {
          settleLater(scrollPauseThatEndsLinkScrollMs);
          schedule();
          return;
        }
        chosenByLink.current = null;
        schedule();
      };
      const onResize = () => schedule();
      measureOnNextFrame.current = schedule;
      schedule();
      doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
      window.addEventListener('resize', onResize);
      const resizes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize);
      if (first?.parentElement) resizes?.observe(first.parentElement);
      const body = root.current;
      const entriesMovedByWrapOrFont =
        typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(drawer.remeasure);
      if (body) entriesMovedByWrapOrFont?.observe(body);
      body?.addEventListener('pointerover', drawer.onPointerOver);
      body?.addEventListener('pointerleave', drawer.onPointerLeave);
      return () => {
        cancelAnimationFrame(frame);
        drawer.stop();
        doc.removeEventListener('scroll', onScroll, { capture: true });
        window.removeEventListener('resize', onResize);
        resizes?.disconnect();
        entriesMovedByWrapOrFont?.disconnect();
        body?.removeEventListener('pointerover', drawer.onPointerOver);
        body?.removeEventListener('pointerleave', drawer.onPointerLeave);
      };
    },
    [ids, settleLater],
  );

  const navigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, id: string) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      latestOnNavigate.current?.(id, event);
      if (event.defaultPrevented) return;
      const target = event.currentTarget.ownerDocument.getElementById(id);
      if (!target) return;
      const scrollBackFromBrowsersJump = rememberScroll(target);
      const choice = { id, settled: false };
      chosenByLink.current = choice;
      cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = requestAnimationFrame(() => {
        scrollBackFromBrowsersJump();
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? 'instant' : 'smooth',
          block: 'start',
        });
        settleLater(scrollPauseThatEndsLinkScrollMs * 2);
        focusSection(target);
      });
    },
    [settleLater, latestOnNavigate],
  );

  const passed = useMemo(() => {
    const index = current ? flat.findIndex((entry) => entry.id === current) : -1;
    return new Set(flat.slice(0, Math.max(0, index)).map((entry) => entry.id));
  }, [flat, current]);

  return (
    <nav
      {...props}
      aria-label={label ?? messages.label}
      className={classNames('env-table-of-contents', className)}
      hidden={items.length === 0 ? true : props.hidden}
    >
      <div className="env-table-of-contents-body" ref={root}>
        <svg
          className="env-table-of-contents-wave"
          ref={shape}
          aria-hidden="true"
          focusable="false"
        >
          <path />
        </svg>
        <List items={items} current={current} passed={passed} depth={0} onNavigate={navigate} />
      </div>
    </nav>
  );
}
