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
import { useLatest } from '../../shared/useLatest';
import { pixelTolerance } from '../../shared/Remeasure';

interface PointerFrame {
  read: (now: number) => void;
  write: () => void;
}

const pointerFrames = new Set<PointerFrame>();
let pointerFramesRun = false;
let afterFrame: MessagePort | null = null;

function writePointerFrames() {
  if (pointerFrames.size === 0) {
    pointerFramesRun = false;
    return;
  }
  afterFrame!.postMessage(undefined);
  const frames = [...pointerFrames];
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

const justBeforeMs = 0.001;

function afterReactCommit(run: () => void) {
  queueMicrotask(run);
}

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

function turnWheels(current: VirtualPointer, plan: Plan, done: number, to: number) {
  for (const wheel of plan.wheels) {
    if (wheel.end <= done || wheel.start > to) continue;
    if (wheel.start > done) current.startWheel(wheel.axis);
    const progress = Math.min(1, (to - wheel.start) / (wheel.end - wheel.start));
    current.turnWheel(wheel.distance * ease(progress));
    if (to >= wheel.end) current.endWheel();
  }
}

interface PointerClock {
  time: number;
  done: number;
}

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
  let next: number | null = null;
  let aimed: { time: number; at: { x: number; y: number }; target: Aimed | null } | null = null;
  let known: AimPoints = new Map();
  let acted = false;
  let readAt = { x: 0, y: 0 };
  const together = clockName ? joinClock(clockName, 0) : null;
  const advance = (to: number, still = false) => {
    const { done } = clockRef.current;
    for (const happening of plan.happenings) {
      if (happening.time <= done || happening.time > to) continue;
      const at = positionAt(scope, plan, happening.time, known);
      acted = true;
      if (at && presentAt(plan, happening.time - justBeforeMs)) current.moveTo(at);
      send(current, happening, cueRef.current);
    }
    if (!still) {
      if (presentAt(plan, to)) {
        const ready = aimed?.time === to ? aimed : null;
        const at = ready ? ready.at : positionAt(scope, plan, to, known);
        if (at) current.moveTo(at, acted ? null : ready?.target);
      } else if (current.present) current.leave();
    }
    turnWheels(current, plan, done, to);
    clockRef.current.done = to;
  };
  const read = (now: number) => {
    next = together ? together.time() % plan.length : clockRef.current.time + (now - last);
    last = now;
    aimed = null;
    known = new Map();
    const box = scope.getBoundingClientRect();
    readAt = { x: box.left, y: box.top };
    const time = next >= plan.length ? next % plan.length : next;
    headFor(scope, headingAt(plan, time));
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
    const box = scope.getBoundingClientRect();
    const stageMovedSinceRead =
      Math.abs(box.left - readAt.x) >= pixelTolerance ||
      Math.abs(box.top - readAt.y) >= pixelTolerance;
    if (stageMovedSinceRead) {
      aimed = null;
      known = new Map();
    }
    let still = false;
    const waitsForOtherPointer = plan.moves.length > 0 && !current.resume();
    if (waitsForOtherPointer) {
      const onlyStaysPut =
        to < plan.length &&
        !plan.moves.some((move) => move.start <= to && move.end >= state.time) &&
        !plan.happenings.some((happening) => happening.time > state.time && happening.time <= to);
      if (!onlyStaysPut) return;
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
  current.showCursor(true);
  return () => {
    stop();
    together?.leave();
    current.suspend();
    current.showCursor(false);
    headFor(scope, null);
  };
}

function usePointerCourse(root: HTMLElement | null, plan: Plan) {
  useEffect(() => (root ? nameMustShow(root, aimsOf(plan)) : undefined), [root, plan]);
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
  const cueTo = useLatest(onCue);
  const restTo = useLatest(onRest);
  const rests = Boolean(onRest);
  useEffect(() => (rests ? claimRest?.() : undefined), [rests, claimRest]);
  const pointer = useRef<VirtualPointer | null>(null);
  const clock = useRef<PointerClock>({ time: 0, done: -1 });
  const [plan] = useState(() => planOf(script));
  usePointerCourse(root, plan);
  useEffect(
    () => () => {
      const gone = pointer.current;
      pointer.current = null;
      afterReactCommit(() => gone?.dispose());
    },
    [],
  );
  useEffect(() => {
    if (playing || rest !== 'start' || !restTo.current) return;
    clock.current = { time: 0, done: -1 };
    afterReactCommit(() => {
      pointer.current?.leave();
      restTo.current?.();
    });
  }, [playing, rest, restTo]);
  useEffect(() => {
    if (!playing || !root) return;
    const current = (pointer.current ??= new VirtualPointer(root));
    return playPointer(root, current, plan, { clockRef: clock, cueRef: cueTo, clockName });
  }, [playing, root, plan, clockName, cueTo]);
}
