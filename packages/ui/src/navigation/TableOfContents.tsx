'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { ActionElement } from '../internal/control/ActionElement.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { tableOfContents } from '../foundations/messages/tableOfContents.js';
import { flatten } from './internal/tableOfContents/contentsOutline.js';
import { focusSection, rememberScroll } from './internal/tableOfContents/sectionScroll.js';
import { useContentsHeadings } from './internal/tableOfContents/useContentsHeadings.js';
import {
  scrollPauseThatEndsLinkScrollMs,
  useReadingPlace,
  type ChosenByLink,
} from './internal/tableOfContents/useReadingPlace.js';
import { prefersReducedMotion } from '../internal/motion/reducedMotion.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import { flag } from '../internal/flag.js';
import { useLatest } from '../internal/useLatest.js';
import '../styles/Base.css';
import '../styles/TableOfContents.css';

/** One entry of a table of contents: a section of the page, and the sections nested in it. */
export interface TableOfContentsItem {
  /** The id of the element the entry leads to: a heading, or any section of the page with an id. */
  id: string;
  /** The entry's text, such as the heading's words or a shorter name for a section. */
  label: ReactNode;
  /** The sections nested under this one, such as a heading's subsections. */
  children?: readonly TableOfContentsItem[];
}

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

interface ContentsListProps {
  items: readonly TableOfContentsItem[];
  current: string | undefined;
  passed: ReadonlySet<string>;
  depth: number;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
}

function ContentsList({ items, current, passed, depth, onNavigate }: ContentsListProps) {
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
            <ContentsList
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
  const chosenByLink = useRef<ChosenByLink | null>(null);
  const scrollFrame = useRef(0);
  const latestOnNavigate = useLatest(onNavigate);
  useEffect(() => () => cancelAnimationFrame(scrollFrame.current), []);
  const flat = useMemo(() => flatten(items), [items]);
  const ids = flat.map((entry) => entry.id).join('\n');
  const { current, settleLater } = useReadingPlace({ ids, root, shape, chosenByLink });

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
        <ContentsList
          items={items}
          current={current}
          passed={passed}
          depth={0}
          onNavigate={navigate}
        />
      </div>
    </nav>
  );
}
