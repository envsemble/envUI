import {
  createContext,
  Fragment,
  use,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { PortalContainer } from '@envsemble/envui';
import { isVirtual, VirtualPointer, type CarriedFile } from './VirtualPointer';

/*
 * The site's animated previews: a tile's, which plays while the pointer or the keyboard is on it,
 * and an animated figure's on a page, which plays while it is in view unless it is paused. Each is
 * the live component, used as a person would use it: a pointer no one sees hovers, presses and
 * drags it (usePointer), and where something else changes, such as a notification arriving, a
 * timeline of steps changes its props (useTimeline). Its still is the animation at its start,
 * never a picture.
 */

/** How the animations inside a preview play. */
interface PlaybackValue {
  /** Whether they play now. */
  playing: boolean;
  /**
   * Where they rest once they stop: back at the start, the still, as a tile does when the pointer
   * leaves it, or where they are, as a paused figure does.
   */
  rest: 'start' | 'hold';
  /** The preview's element, which holds the component and its popups. */
  root: HTMLElement | null;
}

const PlaybackContext = createContext<
  PlaybackValue & {
    /** Takes over going back to the still, from drawing the preview anew; returns the release. */
    claimRest?: () => () => void;
  }
>({ playing: false, rest: 'start', root: null });

/**
 * Plays or stops the animations of a preview. A preview that rests at its start is drawn anew as it
 * stops, so it is its still again, whatever its animation changed, unless it goes back to its
 * still by itself (usePointer's `onRest`), as one whose still would come in with motion again.
 */
export function Playback({
  playing,
  rest,
  root,
  children,
}: PlaybackValue & {
  children: ReactNode;
}) {
  const [round, setRound] = useState(0);
  const [wasPlaying, setWasPlaying] = useState(playing);
  const claims = useRef(0);
  const [claimRest] = useState(() => () => {
    claims.current++;
    return () => {
      claims.current--;
    };
  });
  if (wasPlaying !== playing) {
    setWasPlaying(playing);
    // The claims are taken in effects, so they are counted before a stop.
    if (!playing && rest === 'start' && !claims.current) setRound(round + 1);
  }
  return (
    <PlaybackContext value={{ playing, rest, root, claimRest }}>
      <Fragment key={round}>{children}</Fragment>
    </PlaybackContext>
  );
}

/**
 * Whether the preview plays now, and where it rests once it stops, for an animation that keeps its
 * own clock, such as a width frame's sweep (WidthSweep.tsx), which runs only while it plays.
 */
export function usePlayback() {
  const { playing, rest } = use(PlaybackContext);
  return { playing, rest };
}

/**
 * The layer a preview's overlays render into, inside its canvas, for a tile that renders an
 * overlay live rather than as a picture, such as notifications that arrive and leave with their
 * own motion.
 */
export function usePreviewLayer() {
  const { root } = use(PlaybackContext);
  return root?.querySelector<HTMLElement>(':scope > .catalogue-overlay-layer') ?? null;
}

/**
 * Holds a preview's overlays inside it, live: its menus, popovers, dialogs, sheets and tooltips
 * render through envUI's PortalContainer, contained, into a layer beside the component, so they
 * neither lock the page's scroll, take focus nor close as the reader presses elsewhere, and the
 * pointer no one sees finds them in the preview. The box around it that is a containing block,
 * a tile's canvas or a figure's stage, places them: a dialog's scrim covers it, not the page.
 * Render it as a direct child of the preview's root (Playback), where usePreviewLayer finds it.
 */
export function PreviewOverlays({ children }: { children: ReactNode }) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <PortalContainer container={layer} contained>
        {children}
      </PortalContainer>
      <div ref={setLayer} className="catalogue-overlay-layer" />
    </>
  );
}

/**
 * The step a looping animation is at, from 0, the still: each step lasts its duration, in ms, and
 * the last leads back to the first, so an animation is a list of what changes at each step. It
 * advances only while its preview plays (Playback), and stopped, it goes back to the still or
 * holds where it is, as its preview rests.
 *
 *     const step = useTimeline([600, 1200]);
 *     return <Toast ... />;
 */
export function useTimeline(durations: readonly number[]) {
  const { playing, rest } = use(PlaybackContext);
  const [step, setStep] = useState(0);
  // Whether it has yet to leave its still since it started playing: it leaves it at once.
  const fresh = useRef(true);
  // Stopped, a preview that rests at the still goes back to it at once, in the same render.
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
 * previews plays.
 */
const sharedClocks = new Map<string, { played: number; since: number | null; players: number }>();

/**
 * Joins a shared clock while a preview plays on it: `time` is how long the clock has played, and
 * `leave` stops counting for this preview. A new clock starts `from` that time.
 */
function joinClock(clock: string, from: number) {
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
 * useTimeline for previews that play one timeline together, such as a do and a don't side by side:
 * every preview that names the same `clock` takes its step from one clock, so they keep in step
 * however their timers fall. The clock runs while any of them plays; one paused by itself holds
 * where it is, and plays on in step with the others.
 *
 *     const step = useSharedTimeline('reply', [1100, 140, 140, 2600]);
 */
export function useSharedTimeline(clock: string, durations: readonly number[]) {
  const { playing, rest } = use(PlaybackContext);
  const [step, setStep] = useState(0);
  if (!playing && rest === 'start' && step !== 0) setStep(0);
  const paced = durations.map((duration) => duration * waitPace).join(' ');
  useEffect(() => {
    const lengths = paced.split(' ').map(Number);
    const total = lengths.reduce((sum, length) => sum + length, 0);
    if (!playing || lengths.length < 2) return;
    // A new clock leaves the still at once, as a timeline that starts playing does.
    const own = joinClock(clock, Math.max(0, lengths[0]! - firstWait * 2));
    let timer: number;
    const tick = () => {
      const time = own.time() % total;
      let start = 0;
      let index = 0;
      while (index < lengths.length - 1 && start + lengths[index]! <= time)
        start += lengths[index++]!;
      setStep(index);
      timer = window.setTimeout(tick, start + lengths[index]! - time + 1);
    };
    timer = window.setTimeout(tick);
    return () => {
      window.clearTimeout(timer);
      own.leave();
    };
  }, [playing, clock, paced]);
  return playing || rest === 'hold' ? step : 0;
}

/**
 * One step of what the pointer no one sees does, or of what happens around it:
 * - `wait`, ms: it stays as it is, over the preview or not, pressed or not.
 * - `to`, a selector of an element in the preview: it moves to a point of it, `x` and `y` as
 *   fractions of its box, the middle by default, over `duration` ms, or comes there at once if it
 *   wasn't over the preview. Pressed, it drags; pressed on text, in a field or in content, the drag
 *   selects the text it crosses, as a mouse does, until a press elsewhere.
 * - `press`, `release`: its button; `click` presses and releases it a moment later.
 * - `rightClick`: its secondary button pressed and released, which opens a context menu where it
 *   is, as a right click does.
 * - `leave`: it goes off the preview, releasing its button and any key held first.
 * - `cue`: a moment the preview acts on (usePointer's `onCue`), such as a notification arriving.
 * - `type`, text, `into` a selector of a field: typed a character at a time, `every` ms apart;
 *   `erase`, a count: as many characters deleted the same way.
 * - `key`, such as `ArrowDown` or `Enter`: pressed on the field typed into, or on `on`.
 * - `keyDown`, `keyUp`, a key such as `Alt`: held down and let go, on the field typed into or on
 *   `on`. A held modifier, Alt, Control, Shift or Meta, is on every event meanwhile, so Alt and a
 *   `key` is Alt with that key.
 * - `wheel`, px, down or along `axis` `x` (negative: up, or back): the wheel turned over the
 *   element under the pointer, which scrolls the nearest box around it in the preview that can
 *   scroll, smoothly, over `duration` ms.
 * - `carry`, a file's name, `as` its type and `size` its bytes, or a list of files: the pointer
 *   picks them up, as from the desktop, so its moves drag them; `drop` drops them where it is.
 */
export type PointerStep =
  | { wait: number }
  | { to: string; x?: number; y?: number; duration?: number }
  | { press: true }
  | { release: true }
  | { click: true }
  | { rightClick: true }
  | { leave: true }
  | { cue: string }
  | { type: string; into: string; every?: number }
  | { erase: number; into: string; every?: number }
  | { key: string; on?: string }
  | { keyDown: string; on?: string }
  | { keyUp: string; on?: string }
  | { wheel: number; axis?: 'x' | 'y'; duration?: number }
  | { carry: string; as: string; size?: number }
  | { carry: readonly CarriedFile[] }
  | { drop: true };

/** A point of an element of the preview, as fractions of its box. */
interface Aim {
  selector: string;
  x: number;
  y: number;
}

/**
 * What the pointer does over a script's time: its moves and the turns of its wheel, and its
 * presses, releases, keys and leaves.
 */
interface Plan {
  length: number;
  moves: { start: number; end: number; from: Aim | null; to: Aim }[];
  wheels: { start: number; end: number; distance: number; axis: 'x' | 'y' }[];
  happenings: {
    time: number;
    kind:
      | 'press'
      | 'release'
      | 'leave'
      | 'cue'
      | 'type'
      | 'key'
      | 'keyDown'
      | 'keyUp'
      | 'carry'
      | 'drop';
    /** A cue's name, the text typed (null for a deleted character), or the key. */
    cue?: string;
    text?: string | null;
    /** The field typed into, or the element a key is pressed on. */
    target?: string;
    /** The files carried. */
    files?: readonly CarriedFile[];
    /** The button pressed or released: 2 for the secondary one. */
    button?: 0 | 2;
  }[];
}

/** How long a click holds the button. */
const clickHold = 90;

/*
 * The pace of every animation, brisk: a script's and a timeline's waits are cut to this share of
 * what they are written as, and its moves and typing a little less, so a hand still moves at a
 * hand's speed. An animation starts at once: what a script waits before its first act is cut to
 * `firstWait` at most.
 */
const waitPace = 0.6;
const movePace = 0.8;
const firstWait = 60;

/** How far apart typed characters are, by default: an easy typing pace. */
const typingPace = 140;

/** How long a turn of the wheel takes, by default. */
const wheelTurn = 500;

function planOf(script: readonly PointerStep[]): Plan {
  const plan: Plan = { length: 0, moves: [], wheels: [], happenings: [] };
  let time = 0;
  let at: Aim | null = null;
  let acted = false;
  for (const step of script) {
    if ('wait' in step) {
      time += acted ? step.wait * waitPace : Math.min(firstWait - time, step.wait * waitPace);
      continue;
    }
    acted = true;
    if ('to' in step) {
      const to = { selector: step.to, x: step.x ?? 0.5, y: step.y ?? 0.5 };
      const duration = (step.duration ?? 0) * movePace;
      plan.moves.push({ start: time, end: time + duration, from: at, to });
      at = to;
      time += duration;
    } else if ('press' in step) plan.happenings.push({ time, kind: 'press' });
    else if ('release' in step) plan.happenings.push({ time, kind: 'release' });
    else if ('click' in step) {
      plan.happenings.push({ time, kind: 'press' });
      time += clickHold;
      plan.happenings.push({ time, kind: 'release' });
    } else if ('rightClick' in step) {
      plan.happenings.push({ time, kind: 'press', button: 2 });
      time += clickHold;
      plan.happenings.push({ time, kind: 'release', button: 2 });
    } else if ('wheel' in step) {
      const duration = Math.max(16, (step.duration ?? wheelTurn) * movePace);
      plan.wheels.push({
        start: time,
        end: time + duration,
        distance: step.wheel,
        axis: step.axis ?? 'y',
      });
      time += duration;
    } else if ('keyDown' in step)
      plan.happenings.push({ time, kind: 'keyDown', cue: step.keyDown, target: step.on });
    else if ('keyUp' in step)
      plan.happenings.push({ time, kind: 'keyUp', cue: step.keyUp, target: step.on });
    else if ('cue' in step) plan.happenings.push({ time, kind: 'cue', cue: step.cue });
    else if ('type' in step || 'erase' in step) {
      const characters = 'type' in step ? [...step.type] : Array<null>(step.erase).fill(null);
      for (const text of characters) {
        time += (step.every ?? typingPace) * movePace;
        plan.happenings.push({ time, kind: 'type', text, target: step.into });
      }
    } else if ('key' in step)
      plan.happenings.push({ time, kind: 'key', cue: step.key, target: step.on });
    else if ('carry' in step)
      plan.happenings.push({
        time,
        kind: 'carry',
        files:
          typeof step.carry === 'string' && 'as' in step
            ? [{ name: step.carry, type: step.as, size: step.size }]
            : (step.carry as readonly CarriedFile[]),
      });
    else if ('drop' in step) plan.happenings.push({ time, kind: 'drop' });
    else {
      plan.happenings.push({ time, kind: 'leave' });
      at = null;
    }
  }
  plan.length = Math.max(time, 1);
  return plan;
}

/** Eases a move in and out, as a hand does. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Where an aim is in the viewport now, or nothing where its element isn't shown. */
function pointOf(scope: Element, aim: Aim) {
  const element = scope.querySelector(aim.selector);
  if (!element) return null;
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width * aim.x, y: box.top + box.height * aim.y };
}

/** Whether the pointer is over the preview at a time: after a move began and no leave since. */
function presentAt(plan: Plan, time: number) {
  const entered = Math.max(
    -1,
    ...plan.moves.filter((move) => move.start <= time).map((m) => m.start),
  );
  const left = Math.max(
    -1,
    ...plan.happenings.filter((h) => h.kind === 'leave' && h.time <= time).map((h) => h.time),
  );
  return entered >= 0 && entered > left;
}

/** Where the pointer is at a time: along its move, or where its last move ended. */
function positionAt(scope: Element, plan: Plan, time: number) {
  const move = plan.moves.filter((item) => item.start <= time).at(-1);
  if (!move) return null;
  const to = pointOf(scope, move.to);
  if (time >= move.end || !move.from) return to;
  const from = pointOf(scope, move.from);
  if (!from || !to) return to;
  const progress = ease((time - move.start) / (move.end - move.start));
  return { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
}

/**
 * Plays a script of what the pointer no one sees does over the preview's live component, in a loop
 * while the preview plays: it hovers, presses, drags and releases it by the same events a mouse
 * sends, so the component shows its own hover, press and drag (VirtualPointer.ts). Its clock runs
 * only while the preview plays, so a paused figure holds mid-drag. Write the script to end where it
 * began, off the preview and released, so the loop starts again from the still.
 * - `onCue` hears its cues, the moments where the preview itself changes.
 * - `onRest`, where given, takes the preview back to its still as it stops, in place of drawing
 *   it anew, such as dismissing what a cue showed.
 * - `clock`, a name, plays the script on the clock of the previews that name it, as
 *   useSharedTimeline does, for a do and a don't whose pointers act side by side in step: give
 *   their scripts the same length.
 */
export function usePointer(
  script: readonly PointerStep[],
  {
    onCue,
    onRest,
    clock: clockName,
  }: { onCue?: (cue: string) => void; onRest?: () => void; clock?: string } = {},
) {
  const { playing, rest, root, claimRest } = use(PlaybackContext);
  const cueTo = useRef(onCue);
  const restTo = useRef(onRest);
  useEffect(() => {
    cueTo.current = onCue;
    restTo.current = onRest;
  });
  const rests = Boolean(onRest);
  useEffect(() => (rests ? claimRest?.() : undefined), [rests, claimRest]);
  const pointer = useRef<VirtualPointer | null>(null);
  const clock = useRef({ time: 0, done: -1 });
  const [plan] = useState(() => planOf(script));
  // The pointer's events go out after React's commit, as a component may answer them by
  // rendering at once, which React refuses from inside an effect.
  useEffect(
    () => () => {
      const gone = pointer.current;
      pointer.current = null;
      queueMicrotask(() => gone?.dispose());
    },
    [],
  );
  // Stopped, a preview that goes back to its still by itself does: the pointer goes, and the
  // script starts again from the beginning next time.
  useEffect(() => {
    if (playing || rest !== 'start' || !restTo.current) return;
    clock.current = { time: 0, done: -1 };
    queueMicrotask(() => {
      pointer.current?.leave();
      restTo.current?.();
    });
  }, [playing, rest]);
  useEffect(() => {
    if (!playing || !root) return;
    const scope = root;
    const current = (pointer.current ??= new VirtualPointer(scope));
    let last = performance.now();
    let frame = 0;
    const together = clockName ? joinClock(clockName, 0) : null;
    /** Moves the pointer on to a time of the plan, sending what happens on the way. */
    const advance = (to: number) => {
      const { done } = clock.current;
      for (const happening of plan.happenings) {
        if (happening.time <= done || happening.time > to) continue;
        const at = positionAt(scope, plan, happening.time);
        if (at && presentAt(plan, happening.time - 0.001)) current.moveTo(at);
        if (happening.kind === 'cue') {
          cueTo.current?.(happening.cue!);
          continue;
        }
        if (happening.kind === 'type') {
          current.type(happening.target!, happening.text ?? null);
          continue;
        }
        if (happening.kind === 'key') {
          current.key(happening.cue!, happening.target);
          continue;
        }
        if (happening.kind === 'keyDown') {
          current.keyDown(happening.cue!, happening.target);
          continue;
        }
        if (happening.kind === 'keyUp') {
          current.keyUp(happening.cue!, happening.target);
          continue;
        }
        if (happening.kind === 'carry') {
          current.carry(happening.files!);
          continue;
        }
        if (happening.kind === 'drop') {
          current.drop();
          continue;
        }
        if (happening.kind === 'press') current.press(happening.button);
        else if (happening.kind === 'release') current.release();
        else current.leave();
      }
      if (presentAt(plan, to)) {
        const at = positionAt(scope, plan, to);
        if (at) current.moveTo(at);
      } else if (current.present) current.leave();
      // The wheel turns where the pointer is now, eased in and out, as a hand's flick.
      for (const wheel of plan.wheels) {
        if (wheel.end <= done || wheel.start > to) continue;
        if (wheel.start > done) current.startWheel(wheel.axis);
        const progress = Math.min(1, (to - wheel.start) / (wheel.end - wheel.start));
        current.turnWheel(wheel.distance * ease(progress));
        if (to >= wheel.end) current.endWheel();
      }
      clock.current.done = to;
    };
    const tick = (now: number) => {
      const state = clock.current;
      const next = together ? together.time() % plan.length : state.time + (now - last);
      last = now;
      // While another preview's pointer holds its button down, this one waits: a page has one
      // mouse, and a move without a button, on the document, would end the other's drag. On a
      // shared clock, its time goes on meanwhile.
      if (!current.resume()) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (together && next < state.time) {
        advance(plan.length);
        state.done = -1;
      }
      state.time = next;
      if (state.time >= plan.length) {
        advance(plan.length);
        state.time %= plan.length;
        state.done = -1;
      }
      advance(state.time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      together?.leave();
      current.suspend();
    };
  }, [playing, root, plan, clockName]);
}

/**
 * Whether a tile plays: while a pointer rests on it or the keyboard is on its link. A finger's tap
 * follows the link, so touch doesn't play it. Spread the handlers on the tile.
 */
export function usePlaying() {
  const [pointer, setPointer] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const handlers = {
    // The pointer no one sees, inside the tile's own preview, isn't the reader's.
    onPointerEnter: (event: PointerEvent) => {
      if (!isVirtual(event.nativeEvent)) setPointer(event.pointerType !== 'touch');
    },
    onPointerLeave: (event: PointerEvent) => {
      if (!isVirtual(event.nativeEvent)) setPointer(false);
    },
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
