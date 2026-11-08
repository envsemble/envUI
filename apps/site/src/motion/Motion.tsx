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
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { PortalContainer } from '@envsemble/envui';
import { isVirtual, VirtualPointer, type Aimed } from './VirtualPointer';
import { headFor, holdView, nameCourse, nameMustShow } from './MustShow';
import {
  aimsOf,
  ease,
  firstWait,
  headingAt,
  planOf,
  positionAt,
  presentAt,
  waitPace,
  type AimPoints,
  type PointerStep,
} from './PointerPlan';
import { useSitePopupOpen } from './SitePopup';

export type { PointerStep } from './PointerPlan';

/*
 * The site's stages, where a live component plays: a tile's, while the pointer or the keyboard is
 * on it, and an animated figure's on a page, while it is in view unless it is paused. Each shows
 * the live component, used as a person would use it: a pointer no one sees hovers, presses and
 * drags it (usePointer), and where something else changes, such as a notification arriving, a
 * timeline of steps changes its props (useTimeline). Its still is the animation at its start,
 * never a picture.
 */

/** How the animations inside a stage play. */
interface PlaybackValue {
  /** Whether they play now. */
  playing: boolean;
  /**
   * Where they rest once they stop: back at the start, the still, as a tile does when the pointer
   * leaves it, or where they are, as a paused figure does.
   */
  rest: 'start' | 'hold';
  /** The stage's element, which holds the component and its popups. */
  root: HTMLElement | null;
}

const PlaybackContext = createContext<
  PlaybackValue & {
    /** Takes over going back to the still, from drawing the stage anew; returns the release. */
    claimRest?: () => () => void;
    /** Counts a timeline that sets the stage's props while it is there; returns the release. */
    countTimeline?: () => () => void;
    /** Counts any animation of the stage, a pointer's script too, while it is there (Playback). */
    countAnimation?: () => () => void;
  }
>({ playing: false, rest: 'start', root: null });

/**
 * Plays or stops the animations of a stage. A stage that rests at its start is drawn anew as it
 * stops, so it is its still again, whatever its animation changed, unless it goes back to its
 * still by itself (usePointer's `onRest`), as one whose still would come in with motion again.
 */
export function Playback({
  playing,
  rest,
  root,
  countTimeline,
  countAnimation,
  redraw = false,
  children,
}: PlaybackValue & {
  /** Counts the timelines in it, whose figure is a recording the reader can't take over. */
  countTimeline?: () => () => void;
  /** Counts its animations, timelines and pointers' scripts, such as a tile's, which a still lacks. */
  countAnimation?: () => () => void;
  /**
   * Whether it is drawn anew as it stops whatever its animations do, as a tile is, whose still
   * draws without motion (Related.css): what an animation left behind that it can't set back, such
   * as a menu's highlighted item, goes with it.
   */
  redraw?: boolean;
  children: ReactNode;
}) {
  // A site popup open, such as the Display menu, holds the stages where they are (SitePopup.ts).
  const held = useSitePopupOpen();
  return (
    <PlaybackOf
      playing={playing && !held}
      rest={rest}
      root={root}
      countTimeline={countTimeline}
      countAnimation={countAnimation}
      redraw={redraw}
    >
      {children}
    </PlaybackOf>
  );
}

function PlaybackOf({
  playing,
  rest,
  root,
  countTimeline,
  countAnimation,
  redraw,
  children,
}: PlaybackValue & {
  countTimeline?: () => () => void;
  countAnimation?: () => () => void;
  redraw: boolean;
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
    if (!playing && rest === 'start' && (redraw || !claims.current)) setRound(round + 1);
  }
  return (
    <PlaybackContext value={{ playing, rest, root, claimRest, countTimeline, countAnimation }}>
      <Fragment key={round}>{children}</Fragment>
    </PlaybackContext>
  );
}

/**
 * Whether the stage plays now, and where it rests once it stops, for an animation that keeps its
 * own clock, such as a width frame's sweep (WidthSweep.tsx), which runs only while it plays.
 */
export function usePlayback() {
  const { playing, rest } = use(PlaybackContext);
  return { playing, rest };
}

/**
 * The layer a stage's overlays render into, inside its canvas, for a tile that renders an
 * overlay live rather than as a picture, such as notifications that arrive and leave with their
 * own motion.
 */
export function useStageLayer() {
  const { root } = use(PlaybackContext);
  return root?.querySelector<HTMLElement>(':scope > .catalogue-overlay-layer') ?? null;
}

/**
 * Holds a stage's overlays inside it, live: its menus, popovers, dialogs, sheets and tooltips
 * render through envUI's PortalContainer, contained, into a layer beside the component, so they
 * neither lock the page's scroll, take focus nor close as the reader presses elsewhere, and the
 * pointer no one sees finds them in the stage. The box around it that is a containing block,
 * a tile's canvas or a figure's stage, places them: a dialog's backdrop covers it, not the page.
 * Render it as a direct child of the stage's root (Playback), where useStageLayer finds it.
 *
 * Its tooltips take turns among themselves alone: a tooltip opening closes the one open before it
 * only in the same stage, so a figure's playing pointer never closes the tooltip the reader opened
 * on a live example, nor another figure's. With no wait for the next one past a tooltip closing,
 * as envUI's tooltips have outside any group.
 */
export function StageOverlays({ children }: { children: ReactNode }) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  return (
    <BaseTooltip.Provider timeout={0}>
      <PortalContainer container={layer} contained>
        {children}
      </PortalContainer>
      <div ref={setLayer} className="catalogue-overlay-layer" />
    </BaseTooltip.Provider>
  );
}

/** Counts a timeline in its stage's while it is there, and as one of its animations. */
function useCounted(countTimeline: (() => () => void) | undefined) {
  useEffect(() => countTimeline?.(), [countTimeline]);
  useCountedAnimation();
}

/** Counts an animation in its stage's while it is there. */
function useCountedAnimation() {
  const { countAnimation } = use(PlaybackContext);
  useEffect(() => countAnimation?.(), [countAnimation]);
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
 * `leave` stops counting for this stage. A new clock starts `from` that time.
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

/** A playing pointer's frame: what it reads of the layout, then, in the next frame, what it does. */
interface PointerFrame {
  read: (now: number) => void;
  write: () => void;
}

/**
 * The frames of the pointers playing now, run together. Each moves in an animation frame, and
 * reads where it goes next once the page has rendered that frame, when its layout is up to date:
 * so no pointer's read lays the page out again, whatever moved in the frame, a pointer's events or
 * a transition. The pointer acts on a layout a frame old, which no one sees.
 */
const pointerFrames = new Set<PointerFrame>();
let pointerFramesRun = false;
let afterFrame: MessagePort | null = null;

function writePointerFrames() {
  if (pointerFrames.size === 0) {
    pointerFramesRun = false;
    return;
  }
  // Posted first, so the reads come before any rendering that the moves below schedule.
  afterFrame!.postMessage(undefined);
  const frames = [...pointerFrames];
  // A pointer whose stage stopped on another's move stops here too.
  for (const frame of frames) if (pointerFrames.has(frame)) frame.write();
}

function readPointerFrames() {
  if (pointerFrames.size === 0) {
    pointerFramesRun = false;
    return;
  }
  const now = performance.now();
  for (const frame of pointerFrames) frame.read(now);
  requestAnimationFrame(writePointerFrames);
}

/** Plays a pointer's frame with the others from the next frame on; returns its stop. */
function joinPointerFrames(frame: PointerFrame) {
  pointerFrames.add(frame);
  if (!afterFrame) {
    const channel = new MessageChannel();
    channel.port1.onmessage = readPointerFrames;
    afterFrame = channel.port2;
  }
  if (!pointerFramesRun) {
    pointerFramesRun = true;
    requestAnimationFrame(writePointerFrames);
  }
  return () => void pointerFrames.delete(frame);
}

type Plan = ReturnType<typeof planOf>;

/** Sends one thing a script does at a moment to the pointer, such as a press, a key or a cue. */
function send(
  current: VirtualPointer,
  happening: Plan['happenings'][number],
  onCue: ((cue: string) => void) | undefined,
) {
  switch (happening.kind) {
    case 'cue':
      return onCue?.(happening.cue!);
    case 'type':
      return current.type(happening.target!, happening.text ?? null);
    case 'key':
      return current.key(happening.cue!, happening.target);
    case 'keyDown':
      return current.keyDown(happening.cue!, happening.target);
    case 'keyUp':
      return current.keyUp(happening.cue!, happening.target);
    case 'focus':
    case 'blur':
      return current.keyboardFocus(happening.target ?? null);
    case 'carry':
      return current.carry(happening.files!);
    case 'drop':
      return current.drop();
    case 'press':
      return current.press(happening.button);
    case 'release':
      return current.release();
    case 'leave':
      return current.leave();
  }
}

/** Turns the wheel where the pointer is, from `done` to `to`, eased in and out, as a hand's flick. */
function turnWheels(current: VirtualPointer, plan: Plan, done: number, to: number) {
  for (const wheel of plan.wheels) {
    if (wheel.end <= done || wheel.start > to) continue;
    if (wheel.start > done) current.startWheel(wheel.axis);
    const progress = Math.min(1, (to - wheel.start) / (wheel.end - wheel.start));
    current.turnWheel(wheel.distance * ease(progress));
    if (to >= wheel.end) current.endWheel();
  }
}

/** Where a pointer's script is: the time it has played to, and the last time it acted on. */
interface PointerClock {
  time: number;
  done: number;
}

/**
 * Plays a pointer's script over `scope` from where its clock is, a frame at a time, reading where
 * it goes with the page's other pointers and then moving it (joinPointerFrames); `clockName` plays
 * it on a shared clock (joinClock). Returns the stop, which keeps where it is for the next play.
 */
function playPointer(
  scope: HTMLElement,
  current: VirtualPointer,
  plan: Plan,
  {
    clockRef,
    cueRef,
    clockName,
  }: {
    clockRef: RefObject<PointerClock>;
    cueRef: RefObject<((cue: string) => void) | undefined>;
    clockName: string | undefined;
  },
) {
  let last = performance.now();
  /** The time the next frame moves the pointer to, and where that is, read after the last one. */
  let next: number | null = null;
  let aimed: { time: number; at: { x: number; y: number }; target: Aimed | null } | null = null;
  /**
   * Where the aims were when read. Something happening in the frame, such as a press, moves the
   * pointer by them still: what it changed shows in the next frame's.
   */
  let known: AimPoints = new Map();
  /** Whether something happened in this frame, which may have changed what the pointer is over. */
  let acted = false;
  /** Where the stage was as the aims were read, in the viewport. */
  let readAt = { x: 0, y: 0 };
  const together = clockName ? joinClock(clockName, 0) : null;
  /** Moves the pointer on to a time of the plan, sending what happens on the way. */
  const advance = (to: number, still = false) => {
    const { done } = clockRef.current;
    for (const happening of plan.happenings) {
      if (happening.time <= done || happening.time > to) continue;
      const at = positionAt(scope, plan, happening.time, known);
      acted = true;
      if (at && presentAt(plan, happening.time - 0.001)) current.moveTo(at);
      send(current, happening, cueRef.current);
    }
    if (still) {
      // It stays where it is, whatever moves under it.
    } else if (presentAt(plan, to)) {
      const ready = aimed?.time === to ? aimed : null;
      const at = ready ? ready.at : positionAt(scope, plan, to, known);
      // What is under it, read with the aims, unless something happened since.
      if (at) current.moveTo(at, acted ? null : ready?.target);
    } else if (current.present) current.leave();
    // The wheel turns where the pointer is now.
    turnWheels(current, plan, done, to);
    clockRef.current.done = to;
  };
  /** Reads where the pointer goes in this frame: the time it moves to, and what is there. */
  const read = (now: number) => {
    next = together ? together.time() % plan.length : clockRef.current.time + (now - last);
    last = now;
    aimed = null;
    known = new Map();
    const box = scope.getBoundingClientRect();
    readAt = { x: box.left, y: box.top };
    const time = next >= plan.length ? next % plan.length : next;
    // Where it is heading, which its tile's view keeps in the stage (MustShow.ts).
    headFor(scope, headingAt(plan, time));
    // Where what happens on the way to it happens, through the end of the loop where it ends.
    const { done, time: from } = clockRef.current;
    const loops = next >= plan.length || next < from;
    for (const happening of plan.happenings) {
      const due = loops
        ? happening.time > done || happening.time <= time
        : happening.time > done && happening.time <= time;
      if (due) positionAt(scope, plan, happening.time, known);
    }
    if (!presentAt(plan, time)) return;
    const at = positionAt(scope, plan, time, known);
    if (at) aimed = { time, at, target: current.aim(at) };
  };
  const write = () => {
    const to = next;
    if (to === null) return;
    next = null;
    const state = clockRef.current;
    acted = false;
    // The reader scrolled the page since the aims were read: they are where the stage was, so
    // the frame reads them again where it is now.
    const box = scope.getBoundingClientRect();
    if (Math.abs(box.left - readAt.x) >= 0.5 || Math.abs(box.top - readAt.y) >= 0.5) {
      aimed = null;
      known = new Map();
    }
    // While another stage's pointer holds its button down, this one waits: a page has one
    // mouse, and a move without a button, on the document, would end the other's drag. A
    // script of keys alone, which never moves the pointer, goes on, and so does one where it
    // only stays where it is meanwhile, waiting or turning the wheel. On a
    // shared clock, its time goes on meanwhile.
    let still = false;
    if (plan.moves.length > 0 && !current.resume()) {
      const quiet =
        to < plan.length &&
        !plan.moves.some((move) => move.start <= to && move.end >= state.time) &&
        !plan.happenings.some((happening) => happening.time > state.time && happening.time <= to);
      if (!quiet) return;
      still = true;
    }
    if (together && to < state.time) {
      advance(plan.length);
      state.done = -1;
    }
    state.time = to;
    if (state.time >= plan.length) {
      advance(plan.length);
      state.time %= plan.length;
      state.done = -1;
    }
    advance(state.time, still);
  };
  const stop = joinPointerFrames({ read, write });
  // Its cursor shows while it plays, and goes as it stops or pauses.
  current.showCursor(true);
  return () => {
    stop();
    together?.leave();
    current.suspend();
    current.showCursor(false);
    headFor(scope, null);
  };
}

/** Names what a pointer's script acts on and where it heads, which its tile's view keeps. */
function usePointerCourse(root: HTMLElement | null, plan: Plan) {
  // What it acts on stays in its tile's view as it plays (MustShow.ts).
  useEffect(() => (root ? nameMustShow(root, aimsOf(plan)) : undefined), [root, plan]);
  // Where it heads, which its tile's still is framed on, as its play is (useFit.ts).
  useEffect(
    () =>
      root
        ? nameCourse(
            root,
            plan.moves.map(({ to }) => ({ selector: to.selector, x: to.x, y: to.y })),
          )
        : undefined,
    [root, plan],
  );
}

/**
 * Plays a script of what the pointer no one sees does over the stage's live component, in a loop
 * while the stage plays: it hovers, presses, drags and releases it by the same events a mouse
 * sends, so the component shows its own hover, press and drag (VirtualPointer.ts). Its clock runs
 * only while the stage plays, so a paused figure holds mid-drag. Write the script to end where it
 * began, off the stage and released, so the loop starts again from the still.
 * - `onCue` hears its cues, the moments where the stage itself changes.
 * - `onRest`, where given, takes the stage back to its still as it stops, in place of drawing
 *   it anew, such as dismissing what a cue showed.
 * - `clock`, a name, plays the script on the clock of the stages that name it, as
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
  useCountedAnimation();
  const cueTo = useRef(onCue);
  const restTo = useRef(onRest);
  useEffect(() => {
    cueTo.current = onCue;
    restTo.current = onRest;
  });
  const rests = Boolean(onRest);
  useEffect(() => (rests ? claimRest?.() : undefined), [rests, claimRest]);
  const pointer = useRef<VirtualPointer | null>(null);
  const clock = useRef<PointerClock>({ time: 0, done: -1 });
  const [plan] = useState(() => planOf(script));
  usePointerCourse(root, plan);
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
  // Stopped, a stage that goes back to its still by itself does: the pointer goes, and the
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
    const current = (pointer.current ??= new VirtualPointer(root));
    return playPointer(root, current, plan, { clockRef: clock, cueRef: cueTo, clockName });
  }, [playing, root, plan, clockName]);
}

/**
 * Names elements a tile's animation acts on that its pointer's script doesn't, such as a row a
 * timeline changes, by selectors inside its stage, so they stay in its view as it plays
 * (MustShow.ts).
 */
export function useMustShow(...selectors: string[]) {
  const { root } = use(PlaybackContext);
  const key = selectors.join('\n');
  useEffect(() => (root ? nameMustShow(root, key.split('\n'), true) : undefined), [root, key]);
}

/**
 * Holds a tile's view as it plays, for a tile whose still is its largest state, such as a select
 * resting with its list open: framed on that still, nothing in it is drawn smaller or moved while
 * its animation acts within it (MustShow.ts). With `top`, for a tile that grows as it plays, such
 * as a note gaining a line, it lays out from its window's top, so what it adds grows downward and
 * what stays holds still.
 */
export function useHeldView(top = false) {
  const { root } = use(PlaybackContext);
  useEffect(() => (root ? holdView(root, top) : undefined), [root, top]);
}

/**
 * Whether a tile plays: while a pointer rests on it or the keyboard is on its link. A finger's tap
 * follows the link, so touch doesn't play it. Spread the handlers on the tile.
 */
export function usePlaying() {
  const [pointer, setPointer] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const handlers = {
    // The pointer no one sees, inside the tile's own stage, isn't the reader's.
    onPointerEnter: (event: PointerEvent) => {
      if (!isVirtual(event.nativeEvent)) setPointer(event.pointerType !== 'touch');
    },
    onPointerLeave: (event: PointerEvent) => {
      if (!isVirtual(event.nativeEvent)) setPointer(false);
    },
    // The focus the pointer no one sees brings into a tile's stage, untrusted, isn't the
    // reader's either: it would keep the tile playing once the reader's pointer left it.
    onFocus: (event: FocusEvent) => {
      if (event.nativeEvent.isTrusted) setKeyboard(event.target.matches(':focus-visible'));
    },
    onBlur: (event: FocusEvent) => {
      if (event.nativeEvent.isTrusted) setKeyboard(false);
    },
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
