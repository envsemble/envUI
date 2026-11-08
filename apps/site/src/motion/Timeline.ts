import { use, useEffect, useRef, useState } from 'react';
import { PlaybackContext, useCountedAnimation } from './Playback';
import { firstWait, waitPace } from './pointer/PointerPlan';

/*
 * Timelines: the steps of a stage's animation where something other than a pointer changes it,
 * such as a notification arriving, each a list of what changes at each step.
 */

/** Counts a timeline in its stage's while it is there, and as one of its animations. */
function useCounted(countTimeline: (() => () => void) | undefined) {
  useEffect(() => countTimeline?.(), [countTimeline]);
  useCountedAnimation();
}

/**
 * The step a looping animation is at, from 0, the still: each step lasts its duration, in ms, and
 * the last leads back to the first, so an animation is a list of what changes at each step. It
 * advances only while its stage plays (Playback), and stopped, it goes back to the still or
 * holds where it is, as its stage rests.
 *
 *     const step = useTimeline([600, 1200]);
 *     return <Toast ... />;
 */
export function useTimeline(durations: readonly number[]) {
  const { playing, rest, countTimeline } = use(PlaybackContext);
  useCounted(countTimeline);
  const [step, setStep] = useState(0);
  // Whether it has yet to leave its still since it started playing: it leaves it at once.
  const fresh = useRef(true);
  // Stopped, a stage that rests at the still goes back to it at once, in the same render.
  if (!playing && rest === 'start' && step !== 0) setStep(0);
  const duration = (durations[step] ?? 0) * waitPace;
  const count = durations.length;
  useEffect(() => {
    if (!playing || count < 2) {
      fresh.current = true;
      return;
    }
    const delay = step === 0 && fresh.current ? Math.min(firstWait * 2, duration) : duration;
    const timer = setTimeout(() => {
      fresh.current = false;
      setStep((current) => (current + 1) % count);
    }, delay);
    return () => clearTimeout(timer);
  }, [playing, step, duration, count]);
  return playing || rest === 'hold' ? step : 0;
}

/**
 * The clocks of timelines that play together: the time each has played, counted while any of its
 * stages plays.
 */
const sharedClocks = new Map<string, { played: number; since: number | null; players: number }>();

/**
 * Joins a shared clock while a stage plays on it: `time` is how long the clock has played, and
 * `leave` stops counting for this stage. A new clock starts `from` that time. A pointer's script
 * on a clock (usePointer's `clock`) plays on these too.
 */
export function joinClock(clock: string, from: number) {
  let shared = sharedClocks.get(clock);
  if (!shared) {
    shared = { played: from, since: null, players: 0 };
    sharedClocks.set(clock, shared);
  }
  const own = shared;
  if (own.players++ === 0) own.since = performance.now();
  return {
    time: () => own.played + performance.now() - (own.since ?? performance.now()),
    leave: () => {
      if (--own.players > 0) return;
      own.played += performance.now() - (own.since ?? performance.now());
      own.since = null;
    },
  };
}

/**
 * useTimeline for stages that play one timeline together, such as a do and a don't side by side:
 * every stage that names the same `clock` takes its step from one clock, so they keep in step
 * however their timers fall. The clock runs while any of them plays; one paused by itself holds
 * where it is, and plays on in step with the others.
 *
 *     const step = useSharedTimeline('reply', [1100, 140, 140, 2600]);
 */
export function useSharedTimeline(clock: string, durations: readonly number[]) {
  const { playing, rest, countTimeline } = use(PlaybackContext);
  useCounted(countTimeline);
  const [step, setStep] = useState(0);
  if (!playing && rest === 'start' && step !== 0) setStep(0);
  const paced = durations.map((duration) => duration * waitPace).join(' ');
  useEffect(() => {
    const lengths = paced.split(' ').map(Number);
    const total = lengths.reduce((sum, length) => sum + length, 0);
    if (!playing || lengths.length < 2) return;
    // A new clock leaves the still at once, as a timeline that starts playing does.
    const own = joinClock(clock, Math.max(0, lengths[0] - firstWait * 2));
    let timer: number;
    const tick = () => {
      const time = own.time() % total;
      let start = 0;
      let index = 0;
      while (index < lengths.length - 1 && start + lengths[index] <= time)
        start += lengths[index++];
      setStep(index);
      timer = window.setTimeout(tick, start + lengths[index] - time + 1);
    };
    timer = window.setTimeout(tick);
    return () => {
      window.clearTimeout(timer);
      own.leave();
    };
  }, [playing, clock, paced]);
  return playing || rest === 'hold' ? step : 0;
}
