import { use, useEffect, useRef, useState, type RefObject } from 'react';
import { VirtualPointer } from './VirtualPointer';
import type { Aimed } from './PointerTargets';
import { headFor, nameCourse, nameMustShow } from '../MustShow';
import { PlaybackContext, useCountedAnimation } from '../Playback';
import {
  aimsOf,
  ease,
  headingAt,
  planOf,
  positionAt,
  presentAt,
  type AimPoints,
  type PointerStep,
} from './PointerPlan';
import { joinClock } from '../Timeline';

/*
 * A pointer's script played over a stage's live component (usePointer): a pointer no one sees
 * (VirtualPointer.ts) moves along the script's plan (PointerPlan.ts) a frame at a time, with the
 * page's other playing pointers.
 */

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
