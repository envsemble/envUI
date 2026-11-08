'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type MouseEvent,
  type RefObject,
} from 'react';
import { ActionElement } from '../internal/ActionElement.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { tableOfContents } from '../foundations/messages/tableOfContents.js';
import {
  currentSection,
  readingPosition,
  flatten,
  type TableOfContentsItem,
} from './internal/contentsOutline.js';
import { focusSection, readSections } from './internal/sectionScroll.js';
import { useContentsHeadings } from './internal/useContentsHeadings.js';
import { createWaveDrawer } from './internal/waveDrawer.js';
import { prefersReducedMotion, reducedMotionQuery } from '../internal/reducedMotion.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/TableOfContents.css';

export type { TableOfContentsItem } from './internal/contentsOutline.js';

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
   * The accessible name of the navigation landmark.
   * @default 'On this page', or EnvUIProvider's messages.tableOfContents.label
   */
  'aria-label'?: string;
  /** Classes for the `nav` element. */
  className?: string;
}

const defaultLevels: readonly HeadingLevel[] = [2, 3];

/** How long scrolling must pause before a scroll that a link started counts as finished. */
const settleDelay = 150;

interface ListProps {
  items: readonly TableOfContentsItem[];
  current: string | undefined;
  /** The sections before the current one, in reading order: those the reader has passed. */
  passed: ReadonlySet<string>;
  /** How deep this level is nested: 0 for the top. */
  depth: number;
  onNavigate: (event: MouseEvent<HTMLElement>, id: string) => void;
}

/** One level of the outline: its links, each with the level nested under it. */
function List({ items, current, passed, depth, onNavigate }: ListProps) {
  return (
    <ol
      className="env-table-of-contents-list"
      // The level's depth, which the links take their indent from.
      style={depth > 0 ? ({ '--env-table-of-contents-depth': depth } as CSSProperties) : undefined}
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
  'aria-label': label,
  className,
  ...props
}: TableOfContentsProps) {
  const messages = useMessages('tableOfContents', tableOfContents);
  const root = useRef<HTMLDivElement>(null);
  const shape = useRef<SVGSVGElement>(null);
  const items = useContentsHeadings({ givenItems, container, levels, filter, own: root });
  const [current, setCurrent] = useState<string>();
  // A section a link scrolls to: while the page scrolls there, the marks follow the scroll through
  // the sections between; once scrolling pauses, the chosen section is current, also where the page
  // can't bring it to the reading line, until the reader scrolls on.
  const chosen = useRef<{ id: string; settled: boolean } | null>(null);
  const settle = useRef(0);
  // Measures again on the next frame: set by the effect that tracks the scrolling.
  const refresh = useRef<() => void>(() => {});
  const settleLater = useCallback((delay: number) => {
    clearTimeout(settle.current);
    const choice = chosen.current;
    if (!choice) return;
    settle.current = window.setTimeout(() => {
      choice.settled = true;
      refresh.current();
    }, delay);
  }, []);
  useEffect(() => () => clearTimeout(settle.current), []);
  const flat = useMemo(() => flatten(items), [items]);
  const ids = flat.map((entry) => entry.id).join('\n');

  // The current section, from where the area that holds the sections has scrolled, and the shape
  // beside the list that marks the reader's place.
  useEffect(() => {
    if (ids === '') {
      setCurrent(undefined);
      return;
    }
    const sectionIds = ids.split('\n');
    const first = document.getElementById(sectionIds[0]!);
    const doc = first?.ownerDocument ?? document;
    let frame = 0;

    const drawer = createWaveDrawer(
      () => root.current,
      () => shape.current,
      reducedMotionQuery(),
    );
    const update = () => {
      frame = 0;
      const choice = chosen.current;
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
        // On the way to a chosen section, the marks never pass it, though the page may scroll on
        // to its end, where a later section would be current.
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
      // Only a scroll that moves the sections counts. They are looked up again each time: the page
      // may have rendered them anew since, and a section the effect found first may have left it.
      const section = doc.getElementById(sectionIds[0]!);
      if (target instanceof Element && section && !target.contains(section)) return;
      const choice = chosen.current;
      if (choice && !choice.settled) {
        // A scroll a link started: the marks follow it, and the choice settles once it pauses.
        settleLater(settleDelay);
        schedule();
        return;
      }
      chosen.current = null;
      schedule();
    };
    const onResize = () => schedule();
    refresh.current = schedule;
    schedule();
    doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onResize);
    const resizes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize);
    if (first?.parentElement) resizes?.observe(first.parentElement);
    // The list's own size: labels that wrap anew, or a font that loads, move its entries.
    const body = root.current;
    const reshapes =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(drawer.remeasure);
    if (body) reshapes?.observe(body);
    body?.addEventListener('pointerover', drawer.onPointerOver);
    body?.addEventListener('pointerleave', drawer.onPointerLeave);
    return () => {
      cancelAnimationFrame(frame);
      drawer.stop();
      doc.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
      resizes?.disconnect();
      reshapes?.disconnect();
      body?.removeEventListener('pointerover', drawer.onPointerOver);
      body?.removeEventListener('pointerleave', drawer.onPointerLeave);
    };
  }, [ids, settleLater]);

  const navigate = useCallback(
    (event: MouseEvent<HTMLElement>, id: string) => {
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
      const target = event.currentTarget.ownerDocument.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const choice = { id, settled: false };
      chosen.current = choice;
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'instant' : 'smooth',
        block: 'start',
      });
      settleLater(settleDelay * 2);
      const hash = `#${id}`;
      if (window.location.hash !== hash) window.history.pushState(window.history.state, '', hash);
      focusSection(target);
    },
    [settleLater],
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
        {/* The reader's place: one shape down the list, drawn by the wave drawer. */}
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
