import { use, useEffect, useRef, useState } from 'react';
import { PlaybackContext, useCountedAnimation } from './Playback';
import { firstWait } from './pointer/PointerPlan';

function useCounted(countTimeline: (() => () => void) | undefined) {
  useEffect(() => countTimeline?.(), [countTimeline]);
  useCountedAnimation();
}

export function useTimeline(durations: readonly number[]) {
  const { playing, rest, countTimeline } = use(PlaybackContext);
  useCounted(countTimeline);
  const [step, setStep] = useState(0);
  const notLeftStillYet = useRef(true);
  if (!playing && rest === 'start' && step !== 0) setStep(0);
  const duration = durations[step] ?? 0;
  const count = durations.length;
  useEffect(() => {
    if (!playing || count < 2) {
      notLeftStillYet.current = true;
      return;
    }
    const delay =
      step === 0 && notLeftStillYet.current ? Math.min(firstWait * 2, duration) : duration;
    const timer = setTimeout(() => {
      notLeftStillYet.current = false;
      setStep((current) => (current + 1) % count);
    }, delay);
    return () => clearTimeout(timer);
  }, [playing, step, duration, count]);
  return playing || rest === 'hold' ? step : 0;
}

const sharedClocks = new Map<string, { played: number; since: number | null; players: number }>();

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

export function useSharedTimeline(clock: string, durations: readonly number[]) {
  const { playing, rest, countTimeline } = use(PlaybackContext);
  useCounted(countTimeline);
  const [step, setStep] = useState(0);
  if (!playing && rest === 'start' && step !== 0) setStep(0);
  const durationsKey = durations.join(' ');
  useEffect(() => {
    const lengths = durationsKey.split(' ').map(Number);
    const total = lengths.reduce((sum, length) => sum + length, 0);
    if (!playing || lengths.length < 2) return;
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
  }, [playing, clock, durationsKey]);
  return playing || rest === 'hold' ? step : 0;
}
