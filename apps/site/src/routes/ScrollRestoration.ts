import { holdPlace } from './HoldPlace';

const scrollStateKey = 'siteScroll';
const scrollSaveDelayMs = 100;
const restoreTimeoutMs = 10_000;

interface Kept {
  top: number;
  anchor?: string;
  offset?: number;
}

type State = Record<string, unknown> | null;

const body = () => document.getElementById('site-main');

function keptScroll(): Kept | undefined {
  const kept = (history.state as State)?.[scrollStateKey] as Kept | undefined;
  return typeof kept?.top === 'number' ? kept : undefined;
}

const anchors = '.site-page-column :is(h2, h3, h4, tr)[id]';

function anchorOf(main: HTMLElement): Pick<Kept, 'anchor' | 'offset'> {
  const top = main.getBoundingClientRect().top;
  let found: HTMLElement | undefined;
  for (const element of main.querySelectorAll<HTMLElement>(anchors)) {
    found = element;
    if (element.getBoundingClientRect().top >= top) break;
  }
  return found ? { anchor: found.id, offset: found.getBoundingClientRect().top - top } : {};
}

export function readingAnchor(): string | undefined {
  const main = body();
  if (!main || main.scrollTop <= 0) return undefined;
  const { top, height } = main.getBoundingClientRect();
  const topQuarterLine = top + height / 4;
  let found: string | undefined;
  for (const element of main.querySelectorAll<HTMLElement>(anchors)) {
    if (element.getBoundingClientRect().top > topQuarterLine) break;
    found = element.id;
  }
  return found;
}

export const isAnchor = (element: Element | null) => element?.matches(anchors) ?? false;

export function saveScroll() {
  const main = body();
  if (!main) return;
  const kept: Kept = { top: main.scrollTop, ...(main.scrollTop > 0 && anchorOf(main)) };
  history.replaceState({ ...(history.state as State), [scrollStateKey]: kept }, '');
}

let pending: Kept | undefined;

let saveTimer = 0;

if (typeof window !== 'undefined') {
  addEventListener('popstate', () => {
    clearTimeout(saveTimer);
    pending = keptScroll();
  });
  const navigation = performance.getEntriesByType?.('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  if (navigation?.type === 'reload' || navigation?.type === 'back_forward') pending = keptScroll();
  addEventListener('click', saveScroll, { capture: true });
  addEventListener('pagehide', saveScroll);
}

export function scrolled() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveScroll, scrollSaveDelayMs);
}

export const restoringScroll = () => pending !== undefined;

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
  const pageRendered = () => !main.querySelector('.site-page-skeleton');
  const placeWontMoveAsFiguresLoad = () =>
    kept.anchor !== undefined || !main.querySelector('.site-loading');
  const tallEnoughOrDoneRendering = () =>
    main.scrollHeight - main.clientHeight >= kept.top ||
    !main.querySelector('.site-section-groups[aria-busy], .docs-api[aria-busy]');
  const ready = () => pageRendered() && placeWontMoveAsFiguresLoad() && tallEnoughOrDoneRendering();
  const attempt = () => {
    if (!ready()) return;
    stop();
    const anchor = () => (kept.anchor === undefined ? null : document.getElementById(kept.anchor));
    if (anchor()) hold = holdPlace(main, anchor, kept.offset!);
    else main.scrollTo({ top: kept.top, behavior: 'instant' });
  };
  const observer = new MutationObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(attempt);
  });
  observer.observe(main, { childList: true, subtree: true });
  const interruptions = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  for (const event of interruptions) addEventListener(event, stop, true);
  const timeout = window.setTimeout(stop, restoreTimeoutMs);
  attempt();
  return () => {
    stop();
    hold?.();
  };
}
