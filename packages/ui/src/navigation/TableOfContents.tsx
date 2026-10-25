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

/** How many sections away from the reader's place a dash still grows: three. */
const waveSpread = 3;

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

  // The current section, from where the area that holds the sections has scrolled.
  useEffect(() => {
    if (ids === '') {
      setCurrent(undefined);
      return;
    }
    const sectionIds = ids.split('\n');
    const first = document.getElementById(sectionIds[0]!);
    const doc = first?.ownerDocument ?? document;
    let frame = 0;
    // Each link's reach, from 1 at the reader's place easing to 0 three sections away, which
    // its dash grows and darkens with: set on the links directly, every frame the page scrolls, without
    // rendering the list again.
    const wave = (position: number) => {
      const links = root.current?.querySelectorAll<HTMLElement>('.env-table-of-contents-link');
      links?.forEach((link, index) => {
        // A smooth bell: full at the reader's place, easing to nothing at the spread.
        const distance = Math.min(1, Math.abs(index - position) / waveSpread);
        const reach = Math.cos((distance * Math.PI) / 2) ** 2;
        link.style.setProperty('--env-table-of-contents-reach', reach.toFixed(3));
      });
    };
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
        return;
      }
      const scroller = scrollerOf(elements[0]!);
      const scrolling = scroller ?? doc.scrollingElement ?? doc.documentElement;
      const padding =
        parseFloat(getComputedStyle(scroller ?? doc.documentElement).scrollPaddingTop) || 0;
      const top = scroller ? scroller.getBoundingClientRect().top + scroller.clientTop : 0;
      const height = scroller ? scroller.clientHeight : (doc.defaultView?.innerHeight ?? 0);
      const sections: SectionPosition[] = elements.map((element) => ({
        id: element.id,
        top:
          element.getBoundingClientRect().top -
          top -
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
      if (target instanceof Element && first && !target.contains(first)) return;
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
    return () => {
      cancelAnimationFrame(frame);
      doc.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
      resizes?.disconnect();
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
        <List items={items} current={current} passed={passed} depth={0} onNavigate={navigate} />
      </div>
    </nav>
  );
}
