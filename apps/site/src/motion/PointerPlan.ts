/*
 * The script of the pointer no one sees, as usePointer (Motion.tsx) plays it: the steps a figure
 * writes, and the plan they make of its time, where the pointer is and what it does when, at the
 * site's brisk pace.
 */
import type { CarriedFile } from './VirtualPointer';
import { textPoint } from './VirtualSelection';

/**
 * One step of what the pointer no one sees does, or of what happens around it:
 * - `wait`, ms: it stays as it is, over the preview or not, pressed or not.
 * - `to`, a selector of an element in the preview: it moves to a point of it, `x` and `y` as
 *   fractions of its box, the middle by default, over `duration` ms, or comes there at once if it
 *   wasn't over the preview. Pressed, it drags; pressed on text, in a field or in content, the drag
 *   selects the words it crosses, whole, as a person does, until a press elsewhere. With `text`, a
 *   word or phrase in the element's text or value, it moves to that text: `x` is how far along it,
 *   by its characters, and `y` how far down its line, so a script finds a word wherever the text
 *   wraps, such as `{ to: field, text: 'launch plan', x: 0.1 }` then `x: 0.9` to select it.
 * - `press`, `release`: its button; `click` presses and releases it a moment later, and
 *   `doubleClick` clicks twice, quickly, as a double click; two clicks in quick succession on one
 *   element are a double click too.
 * - `rightClick`: its secondary button pressed and released, which opens a context menu where it
 *   is, as a right click does.
 * - `leave`: it goes off the preview, releasing its button and any key held first.
 * - `cue`: a moment the preview acts on (usePointer's `onCue`), such as a notification arriving.
 * - `type`, text, `into` a selector of a field: typed a character at a time, `every` ms apart;
 *   `erase`, a count: as many characters deleted the same way.
 * - `key`, such as `ArrowDown` or `Enter`: pressed on the field typed into, or on `on`. Tab
 *   leaves the field typed into, which hears its blur; Enter in a single-line field submits its
 *   form.
 * - `focus`, a selector: the keyboard's focus arrives on that element, as a Tab brings it, with
 *   its focus ring; keys then go to it, and where a key moves focus, as an arrow key along tabs
 *   does, it follows. `blur` takes it off the preview again.
 * - `keyDown`, `keyUp`, a key such as `Alt`: held down and let go, on the field typed into or on
 *   `on`. A held modifier, Alt, Control, Shift or Meta, is on every event meanwhile, so Alt and a
 *   `key` is Alt with that key.
 * - `wheel`, px, down or along `axis` `x` (negative: up, or back): the wheel turned over the
 *   element under the pointer, which scrolls the nearest box around it in the preview that can
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
  | { release: true }
  | { click: true }
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

/** A point of an element of the preview, as fractions of its box, or of a text in it. */
interface Aim {
  selector: string;
  text?: string;
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
  for (const step of script) {
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
    else if ('release' in step) plan.happenings.push({ time, kind: 'release' });
    else if ('click' in step) {
      plan.happenings.push({ time, kind: 'press' });
      time += clickHold;
      plan.happenings.push({ time, kind: 'release' });
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

/** Eases a move in and out, as a hand does. */
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Where an aim is in the viewport now, or nothing where its element isn't shown. */
function pointOf(scope: Element, aim: Aim) {
  const element = scope.querySelector(aim.selector);
  if (!element) return null;
  if (aim.text !== undefined) return textPoint(element, aim.text, aim.x, aim.y);
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width * aim.x, y: box.top + box.height * aim.y };
}

/** Whether the pointer is over the preview at a time: after a move began and no leave since. */
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

/** Where the pointer is at a time: along its move, or where its last move ended. */
export function positionAt(scope: Element, plan: Plan, time: number) {
  const move = plan.moves.filter((item) => item.start <= time).at(-1);
  if (!move) return null;
  const to = pointOf(scope, move.to);
  if (time >= move.end || !move.from) return to;
  const from = pointOf(scope, move.from);
  if (!from || !to) return to;
  const progress = ease((time - move.start) / (move.end - move.start));
  return { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
}
