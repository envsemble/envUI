import { day, hour, minute, second } from '../../internal/time/durations.js';

const shownMomentByOnTick = new Map<() => void, number>();
let timer: ReturnType<typeof setTimeout> | undefined;
let scheduledAt = Infinity;
let watchingVisibility = false;

export function subscribeToClock(time: number, onTick: () => void) {
  shownMomentByOnTick.set(onTick, time);
  schedule();
  return () => {
    shownMomentByOnTick.delete(onTick);
    if (shownMomentByOnTick.size === 0) stop();
  };
}

function delayUntilTextMayChange(distance: number) {
  const away = Math.abs(distance);
  if (away < minute) return second;
  const [cadence, finer] = away < day ? [minute, minute] : [hour, day];
  const approaching = distance > 0;
  if (!approaching) return cadence;
  const untilFinerCadence = away - finer;
  return Math.max(second, Math.min(cadence, untilFinerCadence));
}

function schedule() {
  const now = Date.now();
  let delay = hour;
  for (const time of shownMomentByOnTick.values())
    delay = Math.min(delay, delayUntilTextMayChange(time - now));
  const dueTickServesEveryone = timer !== undefined && scheduledAt <= now + delay;
  if (dueTickServesEveryone) return;
  clearTimeout(timer);
  scheduledAt = now + delay;
  timer = setTimeout(tick, delay);
  if (!watchingVisibility && typeof document !== 'undefined') {
    watchingVisibility = true;
    document.addEventListener('visibilitychange', tickWhenPageShownAgain);
  }
}

function tick() {
  clearTimeout(timer);
  timer = undefined;
  scheduledAt = Infinity;
  for (const onTick of [...shownMomentByOnTick.keys()]) onTick();
  if (shownMomentByOnTick.size > 0) schedule();
}

function tickWhenPageShownAgain() {
  if (document.visibilityState === 'visible' && shownMomentByOnTick.size > 0) tick();
}

function stop() {
  clearTimeout(timer);
  timer = undefined;
  scheduledAt = Infinity;
  if (watchingVisibility) {
    watchingVisibility = false;
    document.removeEventListener('visibilitychange', tickWhenPageShownAgain);
  }
}
