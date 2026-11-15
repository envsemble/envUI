import type { CarriedFile } from '../DragControl';
import { textPoint } from './VirtualSelection';
import { remPixels } from '../../shared/Lengths';

export type PointerStep =
  | { wait: number }
  | { to: string; text?: string; x?: number; y?: number; duration?: number }
  | { press: true }
  | { release: true; stay?: boolean }
  | { click: true; stay?: boolean }
  | { doubleClick: true }
  | { rightClick: true }
  | { leave: true }
  | { cue: string }
  | { type: string; into: string; every?: number }
  | { erase: number; into: string; every?: number }
  | { key: string; on?: string }
  | { focus: string }
  | { blur: true }
  | { keyDown: string; on?: string }
  | { keyUp: string; on?: string }
  | { wheel: number; axis?: 'x' | 'y'; duration?: number }
  | { carry: string; as: string; size?: number }
  | { carry: readonly CarriedFile[] }
  | { drop: true };

interface Aim {
  selector: string;
  text?: string;
  x: number;
  y: number;
  aside?: boolean;
}

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
      | 'focus'
      | 'blur'
      | 'carry'
      | 'drop';
    cue?: string;
    text?: string | null;
    target?: string;
    files?: readonly CarriedFile[];
    button?: 0 | 2;
  }[];
}

const clickHoldMs = 90;
const doubleClickGapMs = 110;

const asideAfterMs = 120;
const asideTookMs = 220;
const asideReachRem = 1;

const playedShareOfWritten = 0.8;
export const firstWait = 60;

const typingIntervalMs = 140;

const wheelTurnMs = 500;
const wheelLeastMs = 16;

const asideEdgeInsetPx = 4;

export function planOf(script: readonly PointerStep[]): Plan {
  const plan: Plan = { length: 0, moves: [], wheels: [], happenings: [] };
  let time = 0;
  let at: Aim | null = null;
  let acted = false;
  const stepAside = (index: number) => {
    const step = script[index];
    const next = script[index + 1];
    if (!at || at.aside || at.text !== undefined || ('stay' in step && step.stay)) return;
    if (!next || !('wait' in next) || next.wait < asideAfterMs + asideTookMs) return;
    const to = { ...at, aside: true };
    plan.moves.push({
      start: time + asideAfterMs,
      end: time + asideAfterMs + asideTookMs,
      from: at,
      to,
    });
    at = to;
  };
  for (const [index, step] of script.entries()) {
    if ('wait' in step) {
      time += acted ? step.wait : Math.min(firstWait - time, step.wait);
      continue;
    }
    acted = true;
    if ('to' in step) {
      const to = { selector: step.to, text: step.text, x: step.x ?? 0.5, y: step.y ?? 0.5 };
      const duration = (step.duration ?? 0) * playedShareOfWritten;
      plan.moves.push({ start: time, end: time + duration, from: at, to });
      at = to;
      time += duration;
    } else if ('press' in step) plan.happenings.push({ time, kind: 'press' });
    else if ('release' in step) {
      plan.happenings.push({ time, kind: 'release' });
      stepAside(index);
    } else if ('click' in step) {
      plan.happenings.push({ time, kind: 'press' });
      time += clickHoldMs;
      plan.happenings.push({ time, kind: 'release' });
      stepAside(index);
    } else if ('doubleClick' in step) {
      for (const pause of [doubleClickGapMs, 0]) {
        plan.happenings.push({ time, kind: 'press' });
        time += clickHoldMs;
        plan.happenings.push({ time, kind: 'release' });
        time += pause;
      }
    } else if ('rightClick' in step) {
      plan.happenings.push({ time, kind: 'press', button: 2 });
      time += clickHoldMs;
      plan.happenings.push({ time, kind: 'release', button: 2 });
    } else if ('wheel' in step) {
      const duration = Math.max(
        wheelLeastMs,
        (step.duration ?? wheelTurnMs) * playedShareOfWritten,
      );
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
    else if ('focus' in step) plan.happenings.push({ time, kind: 'focus', target: step.focus });
    else if ('blur' in step) plan.happenings.push({ time, kind: 'blur' });
    else if ('type' in step || 'erase' in step) {
      const characters = 'type' in step ? [...step.type] : Array<null>(step.erase).fill(null);
      for (const text of characters) {
        time += (step.every ?? typingIntervalMs) * playedShareOfWritten;
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

export function aimsOf(plan: Plan): string[] {
  const aims = [
    ...plan.moves.map((move) => move.to.selector),
    ...plan.happenings.flatMap((happening) => (happening.target ? [happening.target] : [])),
  ];
  return [...new Set(aims)];
}

export function headingAt(plan: Plan, time: number): Aim | null {
  if (!presentAt(plan, time)) return null;
  return plan.moves.filter((move) => move.start <= time).at(-1)?.to ?? null;
}

export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export type AimPoints = Map<Aim, { x: number; y: number } | null>;

function pointOf(scope: Element, aim: Aim, known?: AimPoints) {
  const read = known?.get(aim);
  if (read !== undefined) return read;
  const point = readPoint(scope, aim);
  known?.set(aim, point);
  return point;
}

export function aimedElement(scope: Element, selector: string) {
  let found: Element[];
  try {
    found = [...scope.querySelectorAll(selector)];
  } catch {
    return null;
  }
  const shows = (element: Element) => {
    const box = element.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    for (let node = element.parentElement; node && node !== scope; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
      const clip = node.getBoundingClientRect();
      if (x < clip.left || x > clip.right || y < clip.top || y > clip.bottom) return false;
    }
    return true;
  };
  return found.length > 1 ? (found.find(shows) ?? found[0]) : (found[0] ?? null);
}

function readPoint(scope: Element, aim: Aim) {
  const element = aimedElement(scope, aim.selector);
  if (!element) return null;
  if (aim.text !== undefined) return textPoint(element, aim.text, aim.x, aim.y);
  const box = element.getBoundingClientRect();
  const point = { x: box.left + box.width * aim.x, y: box.top + box.height * aim.y };
  return aim.aside ? asideOf(element, box, point) : point;
}

function asideOf(element: Element, box: DOMRect, point: { x: number; y: number }) {
  const own = element instanceof HTMLElement && element.offsetWidth ? element.offsetWidth : 0;
  const scale = own ? box.width / own : 1;
  const rem = remPixels();
  const end = getComputedStyle(element).direction === 'rtl' ? -1 : 1;
  const room = end > 0 ? box.right - point.x : point.x - box.left;
  const step = Math.max(0, Math.min(asideReachRem * rem * scale, room - asideEdgeInsetPx * scale));
  return { x: point.x + end * step, y: point.y };
}

export function presentAt(plan: Plan, time: number) {
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

export function positionAt(scope: Element, plan: Plan, time: number, known?: AimPoints) {
  const move = plan.moves.filter((item) => item.start <= time).at(-1);
  if (!move) return null;
  const to = pointOf(scope, move.to, known);
  if (time >= move.end || !move.from) return to;
  const from = pointOf(scope, move.from, known);
  if (!from || !to) return to;
  const progress = ease((time - move.start) / (move.end - move.start));
  return { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
}
