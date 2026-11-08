/*
 * The script of the pointer no one sees, as usePointer (PointerPlayback.ts) plays it: the steps a figure
 * writes, and the plan they make of its time, where the pointer is and what it does when, at the
 * site's brisk pace.
 */
import type { CarriedFile } from '../DragControl';
import { textPoint } from './VirtualSelection';
import { remPixels } from '@envui-internal/internal/dom/lengths';

/**
 * One step of what the pointer no one sees does, or of what happens around it:
 * - `wait`, ms: it stays as it is, over the stage or not, pressed or not.
 * - `to`, a selector of an element in the stage: it moves to a point of it, `x` and `y` as
 *   fractions of its box, the middle by default, over `duration` ms, or comes there at once if it
 *   wasn't over the stage. Pressed, it drags; pressed on text, in a field or in content, the drag
 *   selects the words it crosses, whole, as a person does, until a press elsewhere. With `text`, a
 *   word or phrase in the element's text or value, it moves to that text: `x` is how far along it,
 *   by its characters, and `y` how far down its line, so a script finds a word wherever the text
 *   wraps, such as `{ to: field, text: 'launch plan', x: 0.1 }` then `x: 0.9` to select it.
 * - `press`, `release`: its button; `click` presses and releases it a moment later, and
 *   `doubleClick` clicks twice, quickly, as a double click; two clicks in quick succession on one
 *   element are a double click too. After a click or a release that a wait follows, the pointer
 *   steps a little aside, as a hand does, about a rem toward the end of what it pressed, staying
 *   on it, so its cursor doesn't hide what the press changes there, such as a button's spinner;
 *   `stay` keeps it where it pressed.
 * - `rightClick`: its secondary button pressed and released, which opens a context menu where it
 *   is, as a right click does.
 * - `leave`: it goes off the stage, releasing its button and any key held first.
 * - `cue`: a moment the stage acts on (usePointer's `onCue`), such as a notification arriving.
 * - `type`, text, `into` a selector of a field: typed a character at a time, `every` ms apart;
 *   `erase`, a count: as many characters deleted the same way.
 * - `key`, such as `ArrowDown` or `Enter`: pressed on the field typed into, or on `on`. Tab
 *   leaves the field typed into, which hears its blur; Enter in a single-line field submits its
 *   form.
 * - `focus`, a selector: the keyboard's focus arrives on that element, as a Tab brings it, with
 *   its focus ring; keys then go to it, and where a key moves focus, as an arrow key along tabs
 *   does, it follows. `blur` takes it off the stage again.
 * - `keyDown`, `keyUp`, a key such as `Alt`: held down and let go, on the field typed into or on
 *   `on`. A held modifier, Alt, Control, Shift or Meta, is on every event meanwhile, so Alt and a
 *   `key` is Alt with that key.
 * - `wheel`, px, down or along `axis` `x` (negative: up, or back): the wheel turned over the
 *   element under the pointer, which scrolls the nearest box around it in the stage that can
 *   scroll, smoothly, over `duration` ms.
 * - `carry`, a file's name, `as` its type and `size` its bytes, or a list of files: the pointer
 *   picks them up, as from the desktop, so its moves drag them; `drop` drops them where it is.
 *   Carry again before the drop for more files at once. An image (PNG, JPEG or WebP) without a
 *   size is a small real picture.
 */
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

/** A point of an element of the stage, as fractions of its box, or of a text in it. */
interface Aim {
  selector: string;
  text?: string;
  x: number;
  y: number;
  /** Whether it is a step aside from that point, after a press (asideOf). */
  aside?: boolean;
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
      | 'focus'
      | 'blur'
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
/** How long a double click waits between its clicks. */
const doubleClickGap = 110;

/** How long after a release the pointer steps aside, and how long the step takes. */
const asideAfter = 120;
const asideTook = 220;
/** How far it steps aside, in rem, at most. */
const asideReach = 1;

/*
 * The pace of every animation, brisk: a script's and a timeline's waits are cut to this share of
 * what they are written as, and its moves and typing a little less, so a hand still moves at a
 * hand's speed. An animation starts at once: what a script waits before its first act is cut to
 * `firstWait` at most.
 */
export const waitPace = 0.6;
const movePace = 0.8;
export const firstWait = 60;

/** How far apart typed characters are, by default: an easy typing pace. */
const typingPace = 140;

/** How long a turn of the wheel takes, by default. */
const wheelTurn = 500;

export function planOf(script: readonly PointerStep[]): Plan {
  const plan: Plan = { length: 0, moves: [], wheels: [], happenings: [] };
  let time = 0;
  let at: Aim | null = null;
  let acted = false;
  /**
   * After a click or a release, where a wait as long as the step follows and the script doesn't
   * say `stay`, the pointer steps aside over that wait, on what it pressed.
   */
  const stepAside = (index: number) => {
    const step = script[index];
    const next = script[index + 1];
    if (!at || at.aside || at.text !== undefined || ('stay' in step && step.stay)) return;
    if (!next || !('wait' in next) || next.wait * waitPace < asideAfter + asideTook) return;
    const to = { ...at, aside: true };
    plan.moves.push({ start: time + asideAfter, end: time + asideAfter + asideTook, from: at, to });
    at = to;
  };
  for (const [index, step] of script.entries()) {
    if ('wait' in step) {
      time += acted ? step.wait * waitPace : Math.min(firstWait - time, step.wait * waitPace);
      continue;
    }
    acted = true;
    if ('to' in step) {
      const to = { selector: step.to, text: step.text, x: step.x ?? 0.5, y: step.y ?? 0.5 };
      const duration = (step.duration ?? 0) * movePace;
      plan.moves.push({ start: time, end: time + duration, from: at, to });
      at = to;
      time += duration;
    } else if ('press' in step) plan.happenings.push({ time, kind: 'press' });
    else if ('release' in step) {
      plan.happenings.push({ time, kind: 'release' });
      stepAside(index);
    } else if ('click' in step) {
      plan.happenings.push({ time, kind: 'press' });
      time += clickHold;
      plan.happenings.push({ time, kind: 'release' });
      stepAside(index);
    } else if ('doubleClick' in step) {
      for (const pause of [doubleClickGap, 0]) {
        plan.happenings.push({ time, kind: 'press' });
        time += clickHold;
        plan.happenings.push({ time, kind: 'release' });
        time += pause;
      }
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
    else if ('focus' in step) plan.happenings.push({ time, kind: 'focus', target: step.focus });
    else if ('blur' in step) plan.happenings.push({ time, kind: 'blur' });
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

/**
 * The selectors of every element a plan acts on: what it moves to, and so presses, drags and turns
 * the wheel over, and what it types into, presses keys on or focuses.
 */
export function aimsOf(plan: Plan): string[] {
  const aims = [
    ...plan.moves.map((move) => move.to.selector),
    ...plan.happenings.flatMap((happening) => (happening.target ? [happening.target] : [])),
  ];
  return [...new Set(aims)];
}

/**
 * Where the pointer is heading at a time of its plan: the aim of the move it is making, or of the
 * last it made; none while it is off the stage.
 */
export function headingAt(plan: Plan, time: number): Aim | null {
  if (!presentAt(plan, time)) return null;
  return plan.moves.filter((move) => move.start <= time).at(-1)?.to ?? null;
}

/** Eases a move in and out, as a hand does. */
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Where aims are in the viewport, as read once in a frame: a pointer reads them before it acts,
 * and finds them here again until it does, rather than reading the layout its own moves changed.
 */
export type AimPoints = Map<Aim, { x: number; y: number } | null>;

/** Where an aim is in the viewport now, or nothing where its element isn't shown. */
function pointOf(scope: Element, aim: Aim, known?: AimPoints) {
  const read = known?.get(aim);
  if (read !== undefined) return read;
  const point = readPoint(scope, aim);
  known?.set(aim, point);
  return point;
}

/**
 * The element of a stage a selector aims at: the first that shows, its middle inside every box
 * around it that clips what overflows it, such as the shown copy of a looping wheel's row rather
 * than one scrolled out of it, else the first there is.
 */
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

/**
 * A step aside from a point of an element: about a rem toward its end, at the scale it is drawn
 * at, but no further than a few px inside its edge, so the pointer stays on it.
 */
function asideOf(element: Element, box: DOMRect, point: { x: number; y: number }) {
  const own = element instanceof HTMLElement && element.offsetWidth ? element.offsetWidth : 0;
  const scale = own ? box.width / own : 1;
  const rem = remPixels();
  const end = getComputedStyle(element).direction === 'rtl' ? -1 : 1;
  const room = end > 0 ? box.right - point.x : point.x - box.left;
  const step = Math.max(0, Math.min(asideReach * rem * scale, room - 4 * scale));
  return { x: point.x + end * step, y: point.y };
}

/** Whether the pointer is over the stage at a time: after a move began and no leave since. */
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

/**
 * Where the pointer is at a time: along its move, or where its last move ended. `known` holds the
 * aims read already in this frame.
 */
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
