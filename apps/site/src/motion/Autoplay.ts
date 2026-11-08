import { useEffect, useSyncExternalStore, type RefObject } from 'react';
import { useDisplaySettings } from '../theme/DisplaySettings';
import { reducedMotionQuery } from '@envui-internal/internal/reducedMotion';

/*
 * Tiles that play by themselves where the reader can't hover, as on a phone, where the galleries
 * read as a feed: once scrolling settles, the tile nearest the middle of the viewport that is
 * mostly in view plays, and the one before it goes back to its still, as when the pointer leaves
 * it. One plays at a time on the whole page, the galleries' tiles and Related's alike. Nothing
 * plays by itself where the Display menu paused the animations or reduced motion is preferred.
 */

/** A device without hover: a touch screen. A mouse, at any width, keeps hover and focus. */
const touchQuery = '(hover: none), (pointer: coarse)';
/** How long scrolling rests before a tile starts, in ms, so a fling plays nothing on its way. */
const settle = 150;
/** The share of a tile in view that counts as mostly in view. */
const mostly = 0.6;
/** How much nearer the middle another tile has to be to take over from the one playing, in px. */
const keep = 48;

/** The tiles that may play by themselves, and those in the viewport now, with their share in it. */
const tiles = new Set<Element>();
const inView = new Map<Element, number>();
let current: Element | null = null;
const listeners = new Set<() => void>();
let observer: IntersectionObserver | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

function play(next: Element | null) {
  if (next === current) return;
  current = next;
  for (const listener of listeners) listener();
}

/** The share of a box in the viewport, of as much of it as the viewport can hold. */
function shownShare(box: DOMRect) {
  const shown = Math.min(box.bottom, innerHeight) - Math.max(box.top, 0);
  return shown / Math.max(1, Math.min(box.height, innerHeight));
}

/** Picks the tile to play: the one mostly in view nearest the viewport's middle. */
function pick() {
  timer = undefined;
  let best: Element | null = null;
  let nearest = Infinity;
  let currentDistance = Infinity;
  for (const element of inView.keys()) {
    const box = element.getBoundingClientRect();
    if (shownShare(box) < mostly) continue;
    const distance = Math.hypot(
      box.left + box.width / 2 - innerWidth / 2,
      box.top + box.height / 2 - innerHeight / 2,
    );
    if (element === current) currentDistance = distance;
    if (distance < nearest) {
      nearest = distance;
      best = element;
    }
  }
  // The one playing goes on unless another is clearly nearer, so a nudge doesn't switch them.
  play(currentDistance - nearest < keep ? current : best);
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(pick, settle);
}

function start() {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.set(entry.target, entry.intersectionRatio);
        else inView.delete(entry.target);
        // Scrolled mostly out of view, the one playing stops at once, before scrolling settles.
        if (entry.target === current && entry.intersectionRatio < mostly) play(null);
      }
      schedule();
    },
    { threshold: [0, mostly] },
  );
  // Scrolling anywhere, the page or a box it scrolls in, moves the tiles.
  addEventListener('scroll', schedule, { capture: true, passive: true });
  addEventListener('resize', schedule);
}

function stop() {
  observer?.disconnect();
  observer = null;
  inView.clear();
  clearTimeout(timer);
  removeEventListener('scroll', schedule, { capture: true });
  removeEventListener('resize', schedule);
}

/** Adds a tile to those that play by themselves; returns its removal. */
function register(element: Element) {
  tiles.add(element);
  if (!observer) start();
  observer!.observe(element);
  return () => {
    tiles.delete(element);
    observer?.unobserve(element);
    inView.delete(element);
    if (current === element) play(null);
    if (!tiles.size) stop();
    else schedule();
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Whether a media query matches now, following it as it changes: the query, or what gives its list,
 * such as the library's reducedMotionQuery.
 */
export function useMedia(query: string | (() => MediaQueryList | null)) {
  const list = () => (typeof query === 'string' ? matchMedia(query) : query());
  return useSyncExternalStore(
    (change) => {
      const media = list();
      media?.addEventListener('change', change);
      return () => media?.removeEventListener('change', change);
    },
    () => list()?.matches ?? false,
    () => false,
  );
}

/**
 * Whether a tile plays by itself now: on a device without hover, while it is the one mostly in
 * view nearest the viewport's middle. `held` is whether it plays by the keyboard, which makes it
 * the one that plays, so two never do. Pass the tile's element, the one its link covers.
 */
export function useAutoplay(element: RefObject<HTMLElement | null>, held = false) {
  const { motionPaused } = useDisplaySettings();
  const touch = useMedia(touchQuery);
  const reduced = useMedia(reducedMotionQuery);
  const active = touch && !reduced && !motionPaused;
  useEffect(() => {
    const target = element.current;
    if (!active || !target) return;
    return register(target);
  }, [active, element]);
  useEffect(() => {
    if (active && held && element.current) play(element.current);
  }, [active, held, element]);
  const playing = useSyncExternalStore(
    subscribe,
    () => current !== null && current === element.current,
    () => false,
  );
  return active && playing;
}
