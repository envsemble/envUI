import { useEffect, useSyncExternalStore, type RefObject } from 'react';
import { useDisplaySettings } from '../display/useDisplaySettings';
import { reducedMotionQuery } from '../shared/ReducedMotion';

const touchQuery = '(hover: none), (pointer: coarse)';
const settleDelayMs = 150;
const mostlyInViewShare = 0.6;
const takeoverMarginPx = 48;

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

function shownShare(box: DOMRect) {
  const shown = Math.min(box.bottom, innerHeight) - Math.max(box.top, 0);
  return shown / Math.max(1, Math.min(box.height, innerHeight));
}

function pick() {
  timer = undefined;
  let best: Element | null = null;
  let nearest = Infinity;
  let currentDistance = Infinity;
  for (const element of inView.keys()) {
    const box = element.getBoundingClientRect();
    if (shownShare(box) < mostlyInViewShare) continue;
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
  const currentNearEnoughToKeep = currentDistance - nearest < takeoverMarginPx;
  play(currentNearEnoughToKeep ? current : best);
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(pick, settleDelayMs);
}

function start() {
  const watching = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.set(entry.target, entry.intersectionRatio);
        else inView.delete(entry.target);
        if (entry.target === current && entry.intersectionRatio < mostlyInViewShare) play(null);
      }
      schedule();
    },
    { threshold: [0, mostlyInViewShare] },
  );
  addEventListener('scroll', schedule, { capture: true, passive: true });
  addEventListener('resize', schedule);
  return (observer = watching);
}

function stop() {
  observer?.disconnect();
  observer = null;
  inView.clear();
  clearTimeout(timer);
  removeEventListener('scroll', schedule, { capture: true });
  removeEventListener('resize', schedule);
}

function register(element: Element) {
  tiles.add(element);
  (observer ?? start()).observe(element);
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
