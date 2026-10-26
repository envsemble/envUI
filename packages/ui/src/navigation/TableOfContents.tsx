'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  outline,
  slug,
  uniqueId,
  type HeadingEntry,
  type SectionPosition,
  type TableOfContentsItem,
} from './internal/contentsOutline.js';
import { heightAt, wavePath, wavePlace, type WaveLayout } from './internal/contentsWave.js';

export type { TableOfContentsItem } from './internal/contentsOutline.js';

/** A heading level, h1 to h6. */
export type TableOfContentsHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

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
  levels?: readonly TableOfContentsHeadingLevel[];
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

const defaultLevels: readonly TableOfContentsHeadingLevel[] = [2, 3];

/** How long scrolling must pause before a scroll that a link started counts as finished. */
const settleDelay = 150;

/** The element `container` names, or the page's main element, or the body. */
function resolveContainer(container: TableOfContentsProps['container']): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (typeof container === 'string') return document.querySelector<HTMLElement>(container);
  if (container) return container.current;
  return document.querySelector<HTMLElement>('main') ?? document.body;
}

/** A heading's words, without parts hidden from assistive technology, such as an anchor's mark. */
function headingText(heading: HTMLElement): string {
  const copy = heading.cloneNode(true) as HTMLElement;
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Reads the headings in a container, giving those without an id one from their words. */
function readHeadings(
  container: HTMLElement,
  levels: readonly TableOfContentsHeadingLevel[],
  filter: ((heading: HTMLElement) => boolean) | undefined,
  own: Element | null,
): HeadingEntry[] {
  if (levels.length === 0) return [];
  const selector = levels.map((level) => `h${level}`).join(', ');
  const entries: HeadingEntry[] = [];
  for (const heading of container.querySelectorAll<HTMLElement>(selector)) {
    if (own?.contains(heading)) continue;
    if (heading.closest('[hidden], [inert], [aria-hidden="true"]')) continue;
    if (filter && !filter(heading)) continue;
    const label = headingText(heading);
    if (!label) continue;
    if (!heading.id) {
      const document = heading.ownerDocument;
      heading.id = uniqueId(slug(label), (id) => document.getElementById(id) !== null);
    }
    entries.push({ id: heading.id, label, level: Number(heading.tagName.slice(1)) });
  }
  return entries;
}

/** The element whose scrolling moves a section, or null for the document. */
function scrollerOf(element: Element): HTMLElement | null {
  const document = element.ownerDocument;
  for (
    let node = element.parentElement;
    node && node !== document.body && node !== document.documentElement;
    node = node.parentElement
  ) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return null;
}

function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Moves focus to a section, which takes it from script alone when it takes none otherwise. */
function focusSection(element: HTMLElement) {
  if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) element.tabIndex = -1;
  element.focus({ preventScroll: true });
}

/** A label or heading text, as a comparable key of the outline. */
function signature(items: readonly TableOfContentsItem[]): string {
  return JSON.stringify(
    items.map((item): unknown => [
      item.id,
      typeof item.label === 'string' ? item.label : '',
      signature(item.children ?? []),
    ]),
  );
}

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
            data-passed={passed.has(item.id) ? '' : undefined}
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

/** How long the shape takes to catch up with the reader's place: its time constant, in ms. */
const glide = 60;

/**
 * Where the entries sit beside the shape, in layout pixels from the top of the list's box, which
 * holds the shape and is the links' offset parent, so a transform or zoom around it changes nothing.
 */
function measureWave(body: HTMLElement, shape: SVGSVGElement): WaveLayout | null {
  const links = body.querySelectorAll<HTMLElement>('.env-table-of-contents-link');
  if (links.length === 0) return null;
  const anchors = Array.from(links, (link) => link.offsetTop + link.offsetHeight / 2);
  const first = links[0]!;
  const last = links[links.length - 1]!;
  const inset = (link: HTMLElement, side: 'paddingTop' | 'paddingBottom') =>
    parseFloat(getComputedStyle(link)[side]) || 0;
  return {
    anchors,
    top: first.offsetTop + inset(first, 'paddingTop'),
    bottom: last.offsetTop + last.offsetHeight - inset(last, 'paddingBottom'),
    full: parseFloat(getComputedStyle(shape).width) || 0,
  };
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
  const [readItems, setReadItems] = useState<readonly TableOfContentsItem[]>([]);
  const items = givenItems ?? readItems;
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
  const filterRef = useRef(filter);
  filterRef.current = filter;
  const levelKey = levels.join(',');
  const flat = useMemo(() => flatten(items), [items]);
  const ids = flat.map((entry) => entry.id).join('\n');

  // Without items, the headings in the container, read again as its content changes.
  useLayoutEffect(() => {
    if (givenItems) return;
    const element = resolveContainer(container);
    if (!element) return;
    const headingLevels = levelKey
      .split(',')
      .filter(Boolean)
      .map(Number) as TableOfContentsHeadingLevel[];
    let last = '';
    const read = () => {
      const next = outline(readHeadings(element, headingLevels, filterRef.current, root.current));
      const key = signature(next);
      if (key === last) return;
      last = key;
      setReadItems(next);
    };
    read();
    if (typeof MutationObserver === 'undefined') return;
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    });
    observer.observe(element, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [givenItems, container, levelKey]);

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
    const reducedMotion =
      typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    let frame = 0;

    // The shape: drawn every frame the reader's place moves, by writing its outline and its colors'
    // reach directly, without rendering the list again. The drawn place glides after the measured
    // one, so a mouse wheel's steps and a chosen section's jump glide rather than jump; at once
    // where reduced motion is preferred.
    let layout: WaveLayout | null = null;
    let target: number | null = null;
    let place: number | null = null;
    // How far each entry's swell under the pointer has grown, and the entry under it.
    let hovers: number[] = [];
    let hovered = -1;
    let drawFrame = 0;
    let drawn = 0;
    const draw = (now: number) => {
      drawFrame = 0;
      const body = root.current;
      const svg = shape.current;
      if (!body || !svg) return;
      if (!layout) {
        layout = measureWave(body, svg);
        if (!layout) return;
        hovers = layout.anchors.map((_, index) => (index === hovered ? 1 : 0));
        const height = body.offsetHeight || 1;
        const gradient = svg.querySelector('linearGradient');
        if (gradient && !gradient.id) {
          // An id of its own on the page, which no other contents share, also in another root.
          gradient.id = `env-table-of-contents-wave-${Math.random().toString(36).slice(2)}`;
          svg.querySelector('path:last-of-type')?.setAttribute('fill', `url(#${gradient.id})`);
        }
        gradient?.setAttribute('y2', String(height));
      }
      const instant = reducedMotion?.matches ?? false;
      // A frame's time since the last drawn, or a frame's at the start of a move.
      const elapsed = drawn === 0 ? 16 : Math.min(100, Math.max(0, now - drawn));
      const ease = instant ? 1 : 1 - Math.exp(-elapsed / glide);
      drawn = now;
      let moving = false;
      if (target === null || place === null || instant) place = target;
      else {
        place += (target - place) * ease;
        if (Math.abs(target - place) < 0.002) place = target;
        else moving = true;
      }
      hovers = hovers.map((amount, index) => {
        const goal = index === hovered ? 1 : 0;
        const next = instant ? goal : amount + (goal - amount) * ease;
        if (Math.abs(goal - next) < 0.005) return goal;
        moving = true;
        return next;
      });
      const outline = wavePath(layout, place, hovers);
      svg.querySelectorAll('path').forEach((path) => path.setAttribute('d', outline));
      // The fill over the track ends at the swell's apex, as a slider's at its thumb: the passed
      // sections above, the coming ones below. Without a place, all is still to come.
      const apex =
        place === null
          ? '0'
          : (heightAt(layout.anchors, place) / (body.offsetHeight || 1)).toFixed(4);
      svg.querySelectorAll<SVGStopElement>('stop').forEach((stop) => {
        if (stop.getAttribute('offset') !== apex) stop.setAttribute('offset', apex);
      });
      if (moving) drawFrame = requestAnimationFrame(draw);
      else drawn = 0;
    };
    const redraw = () => {
      if (drawFrame === 0) drawFrame = requestAnimationFrame(draw);
    };
    const wave = (position: number | null) => {
      target = position === null ? null : wavePlace(position);
      cancelAnimationFrame(drawFrame);
      draw(performance.now());
    };
    const remeasure = () => {
      layout = null;
      redraw();
    };
    // The entry under a mouse swells the shape a little, as a brush pressed there.
    const hover = (index: number) => {
      if (hovered === index) return;
      hovered = index;
      redraw();
    };
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      const links = root.current?.querySelectorAll('.env-table-of-contents-link');
      hover(link && links ? Array.prototype.indexOf.call(links, link) : -1);
    };
    const onPointerLeave = () => hover(-1);

    const update = () => {
      frame = 0;
      const choice = chosen.current;
      if (choice?.settled) {
        setCurrent(choice.id);
        wave(sectionIds.indexOf(choice.id));
        return;
      }
      const elements = sectionIds
        .map((id) => doc.getElementById(id))
        .filter((element): element is HTMLElement => element !== null);
      if (elements.length === 0) {
        setCurrent(undefined);
        wave(null);
        return;
      }
      const scroller = scrollerOf(elements[0]!);
      const scrolling = scroller ?? doc.scrollingElement ?? doc.documentElement;
      const padding =
        parseFloat(getComputedStyle(scroller ?? doc.documentElement).scrollPaddingTop) || 0;
      // Where the sections are drawn, in layout pixels of the area that scrolls them, as its
      // scroll position, height and padding are: a transform or zoom around it scales the drawing.
      const box = scroller?.getBoundingClientRect();
      const scale =
        scroller && box && scroller.offsetHeight > 0 ? box.height / scroller.offsetHeight || 1 : 1;
      const top = scroller && box ? box.top + scroller.clientTop * scale : 0;
      const height = scroller ? scroller.clientHeight : (doc.defaultView?.innerHeight ?? 0);
      const sections: SectionPosition[] = elements.map((element) => ({
        id: element.id,
        top:
          (element.getBoundingClientRect().top - top) / scale -
          padding -
          (parseFloat(getComputedStyle(element).scrollMarginTop) || 0),
      }));
      const view = {
        height: Math.max(0, height - padding),
        scrolled: scrolling.scrollTop,
        range: scrolling.scrollHeight - scrolling.clientHeight,
      };
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
      wave(position);
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
    const reshapes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(remeasure);
    if (body) reshapes?.observe(body);
    body?.addEventListener('pointerover', onPointerOver);
    body?.addEventListener('pointerleave', onPointerLeave);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(drawFrame);
      doc.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
      resizes?.disconnect();
      reshapes?.disconnect();
      body?.removeEventListener('pointerover', onPointerOver);
      body?.removeEventListener('pointerleave', onPointerLeave);
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
        {/* The reader's place: one shape down the list, drawn and colored by the effect above. */}
        <svg
          className="env-table-of-contents-wave"
          ref={shape}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0">
              {/* The fill, then none, both at the apex: a hard edge. */}
              <stop data-read="" />
              <stop />
            </linearGradient>
          </defs>
          {/* The track, the whole shape; the fill over it, down to the apex. */}
          <path />
          <path />
        </svg>
        <List items={items} current={current} passed={passed} depth={0} onNavigate={navigate} />
      </div>
    </nav>
  );
}
