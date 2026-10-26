import {
  createContext,
  use,
  useEffect,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';

/*
 * The site's animated previews: a tile's, which plays while the pointer or the keyboard is on it,
 * and an animated figure's on a page, which plays while it is in view unless it is paused. Each is
 * the live component driven through its props by a timeline of steps, so its still is the
 * animation resting on its first step, never a picture. Only timers run, and only while it plays.
 */

/** How the animations inside a preview play. */
interface PlaybackValue {
  /** Whether they play now. */
  playing: boolean;
  /**
   * Where they rest once they stop: back at the first step, the still, as a tile does when the
   * pointer leaves it, or where they are, as a paused figure does.
   */
  rest: 'start' | 'hold';
}

const PlaybackContext = createContext<PlaybackValue>({ playing: false, rest: 'start' });

/** Plays or stops the animations of a preview, its timelines (useTimeline). */
export function Playback({
  playing,
  rest,
  children,
}: PlaybackValue & {
  children: ReactNode;
}) {
  return <PlaybackContext value={{ playing, rest }}>{children}</PlaybackContext>;
}

/**
 * The step a looping animation is at, from 0, the still: each step lasts its duration, in ms, and
 * the last leads back to the first, so an animation is a list of what changes at each step. It
 * advances only while its preview plays (Playback), and stopped, it goes back to the still or
 * holds where it is, as its preview rests.
 *
 *     const step = useTimeline([600, 1200]);
 *     return <Switch label="Wi-Fi" checked={step === 1} />;
 */
export function useTimeline(durations: readonly number[]) {
  const { playing, rest } = use(PlaybackContext);
  const [step, setStep] = useState(0);
  // Stopped, a preview that rests at the still goes back to it at once, in the same render.
  if (!playing && rest === 'start' && step !== 0) setStep(0);
  const duration = durations[step] ?? 0;
  const count = durations.length;
  useEffect(() => {
    if (!playing || count < 2) return;
    const timer = setTimeout(() => setStep((current) => (current + 1) % count), duration);
    return () => clearTimeout(timer);
  }, [playing, step, duration, count]);
  return playing || rest === 'hold' ? step : 0;
}

/**
 * Whether a tile plays: while a pointer rests on it or the keyboard is on its link. A finger's tap
 * follows the link, so touch doesn't play it. Spread the handlers on the tile.
 */
export function usePlaying() {
  const [pointer, setPointer] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const handlers = {
    onPointerEnter: (event: PointerEvent) => setPointer(event.pointerType !== 'touch'),
    onPointerLeave: () => setPointer(false),
    onFocus: (event: FocusEvent) => setKeyboard(event.target.matches(':focus-visible')),
    onBlur: () => setKeyboard(false),
  };
  return [pointer || keyboard, handlers] as const;
}

/** Whether an element is in the viewport now, so an animation plays only where it can be seen. */
export function useInView(element: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const target = element.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) =>
      setInView(entries.some((entry) => entry.isIntersecting)),
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [element]);
  return inView;
}
