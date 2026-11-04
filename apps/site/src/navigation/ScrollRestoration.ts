/**
 * Where the reader was on each page of the history, so Back and Forward return to it, as a browser
 * does for pages it loads itself: the site scrolls its body, #site-main, rather than the document,
 * which browsers don't restore. Each entry of the history keeps the body's scroll in its state,
 * written as the reader scrolls and as a link is followed; going back or forward to an entry, or
 * reloading it, scrolls the body there once the page is tall enough. A new page opens at its top,
 * and an address that names a section at the section, as before.
 */

import { holdPlace } from './HoldPlace';

/** The key of the body's scroll in an entry's state. */
const key = 'siteScroll';

/**
 * Where the body was scrolled: its scroll, and the heading nearest its top with how far below the
 * top it was, which the page is scrolled back to, as parts above it may load to another height.
 */
interface Kept {
  top: number;
  anchor?: string;
  offset?: number;
}

type State = Record<string, unknown> | null;

/** The body that scrolls, once the shell has rendered it. */
const body = () => document.getElementById('site-main');

/** The scroll the current entry kept, if any. */
function keptScroll(): Kept | undefined {
  const kept = (history.state as State)?.[key] as Kept | undefined;
  return typeof kept?.top === 'number' ? kept : undefined;
}

/** What can hold the reader's place: the page's headings and props' rows, by their ids. */
const anchors = '.site-page-column :is(h2, h3, h4, tr)[id]';

/** The first heading at or below the body's top, or else the last above it. */
function anchorOf(main: HTMLElement): Pick<Kept, 'anchor' | 'offset'> {
  const top = main.getBoundingClientRect().top;
  let found: HTMLElement | undefined;
  for (const element of main.querySelectorAll<HTMLElement>(anchors)) {
    found = element;
    if (element.getBoundingClientRect().top >= top) break;
  }
  return found ? { anchor: found.id, offset: found.getBoundingClientRect().top - top } : {};
}

/**
 * The section the reader is in: the last heading or props' row at or above the top quarter of the
 * body, by its id; none at the page's top, where its banner shows.
 */
export function readingAnchor(): string | undefined {
  const main = body();
  if (!main || main.scrollTop <= 0) return undefined;
  const { top, height } = main.getBoundingClientRect();
  let found: string | undefined;
  for (const element of main.querySelectorAll<HTMLElement>(anchors)) {
    if (element.getBoundingClientRect().top > top + height / 4) break;
    found = element.id;
  }
  return found;
}

/** Whether an element is one that holds the reader's place, a heading or a props' row. */
export const isAnchor = (element: Element | null) => element?.matches(anchors) ?? false;

/** Writes the body's scroll into the current entry, keeping its other state and its address. */
export function saveScroll() {
  const main = body();
  if (!main) return;
  const kept: Kept = { top: main.scrollTop, ...(main.scrollTop > 0 && anchorOf(main)) };
  history.replaceState({ ...(history.state as State), [key]: kept }, '');
}

/** The scroll of the entry that Back, Forward or a reload has just shown, until it is restored. */
let pending: Kept | undefined;

/** A save the reader's scrolling has asked for, a moment after it stops. */
let saveTimer = 0;

if (typeof window !== 'undefined') {
  // Each history step reads the scroll its entry kept. A save still waiting is dropped, as it
  // would write the page left behind into the entry now shown.
  addEventListener('popstate', () => {
    clearTimeout(saveTimer);
    pending = keptScroll();
  });
  const navigation = performance.getEntriesByType?.('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (navigation?.type === 'reload' || navigation?.type === 'back_forward') pending = keptScroll();
  // A press, such as on a link, or leaving the site writes the scroll at once, before the history
  // moves on.
  addEventListener('click', saveScroll, { capture: true });
  addEventListener('pagehide', saveScroll);
}

/** Saves the body's scroll a moment after the reader stops scrolling: listen to its scroll events. */
export function scrolled() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveScroll, 100);
}

/**
 * Whether the page now shown returns to a scroll it kept, which its sections then render for at
 * once (useRevealed), so the place is there.
 */
export const restoringScroll = () => pending !== undefined;

/**
 * Scrolls the body back to where the entry now shown kept it, once the page has rendered tall
 * enough, and returns its cleanup; undefined when there is nothing to restore. A page still
 * loading, shown as its skeleton, is waited for. The heading it kept is then held where it was
 * while parts above it finish loading (holdPlace). The reader scrolling, pressing or typing
 * meanwhile stops it.
 */
export function restoreScroll(main: HTMLElement): (() => void) | undefined {
  const kept = pending;
  if (kept === undefined) return undefined;
  let frame = 0;
  let hold: (() => void) | undefined;
  const stop = () => {
    pending = undefined;
    cancelAnimationFrame(frame);
    observer.disconnect();
    clearTimeout(timeout);
    for (const event of interruptions) removeEventListener(event, stop, true);
  };
  const ready = () =>
    !main.querySelector('.site-page-skeleton') &&
    (main.scrollHeight - main.clientHeight >= kept.top ||
      !main.querySelector('.site-section-groups[aria-busy], .docs-api[aria-busy]'));
  const attempt = () => {
    if (!ready()) return;
    stop();
    const anchor = () => (kept.anchor === undefined ? null : document.getElementById(kept.anchor));
    if (anchor()) hold = holdPlace(main, anchor, kept.offset!);
    else main.scrollTo({ top: kept.top, behavior: 'instant' });
  };
  // The page renders after this runs: try on each frame its content changes.
  const observer = new MutationObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(attempt);
  });
  observer.observe(main, { childList: true, subtree: true });
  const interruptions = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  for (const event of interruptions) addEventListener(event, stop, true);
  // A page that never gets there stops being waited for.
  const timeout = window.setTimeout(stop, 10_000);
  attempt();
  return () => {
    stop();
    hold?.();
  };
}
