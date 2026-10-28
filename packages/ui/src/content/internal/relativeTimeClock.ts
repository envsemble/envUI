import { day, hour, minute, second } from '../../internal/durations.js';

/** Each mounted RelativeTime: what to call on a tick, and the moment it shows. */
const subscribers = new Map<() => void, number>();
let timer: ReturnType<typeof setTimeout> | undefined;
let scheduledAt = Infinity;
let watchingVisibility = false;

/**
 * One timer for every RelativeTime on the page. It wakes as often as the nearest moment needs:
 * every second while one is less than a minute away, every minute while one is less than a day
 * away, and every hour beyond. Each tick asks every subscriber to read its text again; React
 * renders only those whose text changed.
 */
export function subscribeToClock(time: number, onTick: () => void) {
  subscribers.set(onTick, time);
  schedule();
  return () => {
    subscribers.delete(onTick);
    if (subscribers.size === 0) stop();
  };
}

/** How long a moment's text can wait for the next tick. */
function delayFor(distance: number) {
  const away = Math.abs(distance);
  if (away < minute) return second;
  const [cadence, finer] = away < day ? [minute, minute] : [hour, day];
  // A moment ahead comes nearer: wake when it needs the finer cadence.
  return distance > 0 ? Math.max(second, Math.min(cadence, away - finer)) : cadence;
}

function schedule() {
  const now = Date.now();
  let delay = hour;
  for (const time of subscribers.values()) delay = Math.min(delay, delayFor(time - now));
  // A tick already due sooner serves the new subscriber too.
  if (timer !== undefined && scheduledAt <= now + delay) return;
  clearTimeout(timer);
  scheduledAt = now + delay;
  timer = setTimeout(tick, delay);
  if (!watchingVisibility && typeof document !== 'undefined') {
    watchingVisibility = true;
    document.addEventListener('visibilitychange', onVisibilityChange);
  }
}

function tick() {
  clearTimeout(timer);
  timer = undefined;
  scheduledAt = Infinity;
  for (const onTick of [...subscribers.keys()]) onTick();
  if (subscribers.size > 0) schedule();
}

/** Browsers slow timers in hidden pages; a page shown again reads the time at once. */
function onVisibilityChange() {
  if (document.visibilityState === 'visible' && subscribers.size > 0) tick();
}

function stop() {
  clearTimeout(timer);
  timer = undefined;
  scheduledAt = Infinity;
  if (watchingVisibility) {
    watchingVisibility = false;
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }
}
