/*
 * The room an open example makes in its figure for its overlays (OpenExample.tsx): the overlays
 * that rest open in its layer, the padding that centres a popup with what opens it, and how much
 * taller the stage grows for a dialog, a sheet or a toast placed on it; and the stage's recorded
 * height, held while the room is made.
 */
import { recordedSize } from '../loading/Loading';
import { inset, union, type Box } from './FitMath';

/**
 * The box that places the figure's dialogs, sheets and toasts: the stage, or in an anatomy figure,
 * the room, which keeps them clear of the stage's padding, where the callouts go, or on a do or
 * don't figure's square, the box over it that is drawn smaller to fit it (useVerdictFit.ts).
 */
const stageOf = (element: HTMLElement) => {
  const room = element.closest<HTMLElement>('.catalogue-open-example');
  if (room && getComputedStyle(room).contain.includes('layout')) return room;
  return (
    element.closest<HTMLElement>('.site-verdict[data-shape="square"] .site-verdict-fit') ??
    element.closest<HTMLElement>('.site-live-example, .site-verdict-stage, .site-anatomy-stage') ??
    element
  );
};

/**
 * The scale a box is drawn at, such as a do or don't figure's box drawn smaller to fit its square:
 * what the viewport measures, divided by it, is in the box's own px.
 */
const scaleOf = (element: HTMLElement) =>
  (element.offsetWidth && element.getBoundingClientRect().width / element.offsetWidth) || 1;

/**
 * The overlays in the layer: each outermost box that isn't a backdrop or a positioner over the whole
 * stage.
 */
export function overlays(layer: HTMLElement) {
  const stage = stageOf(layer);
  const scale = scaleOf(stage);
  const area = { width: stage.clientWidth * scale, height: stage.clientHeight * scale };
  const found: HTMLElement[] = [];
  const visit = (element: Element) => {
    for (const child of element.children) {
      if (!(child instanceof HTMLElement)) continue;
      const box = child.getBoundingClientRect();
      // A backdrop or a positioner is fixed and covers the stage; what it holds is the overlay, even
      // where that fills the stage too, such as a sheet in a narrow figure.
      const covers =
        box.width >= area.width - 1 &&
        box.height >= area.height - 1 &&
        getComputedStyle(child).position === 'fixed';
      if (box.width > 1 && box.height > 1 && !covers) found.push(child);
      else visit(child);
    }
  };
  visit(layer);
  return found;
}

/**
 * Whether an overlay is placed on the stage, as a dialog, a sheet or a toast is, rather than
 * beside its anchor, as a popup is: its nearest positioned box within the layer is fixed.
 */
function placedOnStage(element: HTMLElement, layer: HTMLElement) {
  for (let node: HTMLElement | null = element; node && node !== layer; node = node.parentElement) {
    const position = getComputedStyle(node).position;
    if (position === 'fixed') return true;
    if (position === 'absolute') return false;
  }
  return false;
}

/**
 * How much taller an overlay would be at its content's height: a dialog's height may be capped at
 * the stage's, and a list in it scrolls there. The figure grows again until nothing is cut off.
 */
function cutOff(overlay: HTMLElement) {
  const cut = (element: HTMLElement) => Math.max(0, element.scrollHeight - element.clientHeight);
  let inner = 0;
  for (const element of overlay.querySelectorAll<HTMLElement>('*'))
    if (/auto|scroll/.test(getComputedStyle(element).overflowY))
      inner = Math.max(inner, cut(element));
  return cut(overlay) + inner;
}

/** The fixed box that places an overlay, such as a dialog's positioner, if another does. */
function placerOf(overlay: HTMLElement, layer: HTMLElement) {
  for (let node = overlay.parentElement; node && node !== layer; node = node.parentElement)
    if (getComputedStyle(node).position === 'fixed') return node;
  return undefined;
}

/**
 * Where on the stage an overlay is placed: by the alignment of the box that places it, or where
 * it places itself, such as toasts, by its placement attribute, else by the nearer edge.
 */
function placement(overlay: HTMLElement, placer: HTMLElement | undefined, gaps: [number, number]) {
  if (!placer) {
    const named = overlay.dataset.placement ?? overlay.dataset.side ?? '';
    if (/bottom/.test(named)) return 'end';
    if (/top/.test(named)) return 'start';
    return gaps[1] < gaps[0] ? 'end' : 'start';
  }
  const align = getComputedStyle(placer).alignItems;
  if (/end/.test(align)) return 'end';
  if (/start/.test(align)) return 'start';
  return /stretch|normal/.test(align) ? 'stretch' : 'center';
}

/**
 * How much taller the stage must grow for an overlay placed on it: room for its content, and the
 * stage's padding, at least the inset, on each side of a centred one, or on the far side of one
 * placed at an edge, such as a palette near the top or a toast at the bottom, which keeps its own
 * gap there; a sheet as tall as the stage needs only its content. On that far side the box that
 * places it may keep a gap of its own, such as a bottom sheet's room above it, which the stage
 * makes room for too. A toast, which covers no page, leaves the room's content, centred, clear of
 * it.
 */
function shortfall(overlay: HTMLElement, layer: HTMLElement, stage: HTMLElement, content: number) {
  const box = overlay.getBoundingClientRect();
  const area = stage.getBoundingClientRect();
  const space = Math.max(inset, parseFloat(getComputedStyle(stage).paddingTop)) * scaleOf(stage);
  const above = box.top - area.top;
  const below = area.bottom - box.bottom;
  const height = box.height + cutOff(overlay);
  const placer = placerOf(overlay, layer);
  const side = placement(overlay, placer, [above, below]);
  const placerStyle = placer && getComputedStyle(placer);
  const far = (gap: string | undefined) =>
    Math.max(space, (parseFloat(gap ?? '') || 0) * scaleOf(stage));
  let needed = {
    start: above + height + far(placerStyle?.paddingBottom),
    end: far(placerStyle?.paddingTop) + height + below,
    center: height + 2 * space,
    stretch: height,
  }[side];
  if (!placer && content && (side === 'start' || side === 'end'))
    needed = Math.max(needed, content + 2 * (space + height + Math.min(above, below)));
  return needed - area.height;
}

/** What opens the overlays, in the flow: not the layer, nor the focus guards beside a trigger. */
function inFlow(room: HTMLElement, layer: Element) {
  return [...room.children]
    .filter((child) => child !== layer && !/absolute|fixed/.test(getComputedStyle(child).position))
    .map((child) => child.getBoundingClientRect())
    .filter((box) => box.width || box.height);
}

/**
 * The box of what opens a figure's popups, such as a select's field, where its popups open beside
 * it rather than over it: an anatomy figure's callouts keep clear of it.
 */
export function openerBox(subject: HTMLElement): Box | undefined {
  const room = subject.querySelector<HTMLElement>('.catalogue-open-example');
  const layer = room?.querySelector('.catalogue-overlay-layer');
  if (!room || !layer) return undefined;
  const found = overlays(layer as HTMLElement);
  if (!found.length || found.some((overlay) => placedOnStage(overlay, layer as HTMLElement)))
    return undefined;
  const content = inFlow(room, layer);
  return content.length ? union(content) : undefined;
}

/**
 * Whether an overlay is on its way in or out: starting or ending its entrance, or in a transition
 * or an animation that ends, unlike a spinner's turn. Its box is then on the way, not where it
 * rests.
 */
const moving = (overlay: HTMLElement) =>
  overlay.closest('[data-starting-style], [data-ending-style]') !== null ||
  overlay.querySelector('[data-starting-style], [data-ending-style]') !== null ||
  overlay
    .getAnimations({ subtree: true })
    .some(
      (animation) =>
        animation.playState === 'running' &&
        animation.effect?.getComputedTiming().iterations !== Infinity,
    );

/**
 * Makes room in the figure for its open overlays, and centres them with what opens them: a popup
 * beside its trigger widens the room on its side, so the two together sit in the middle of the
 * stage; a dialog, a sheet or a toast, placed on the stage, makes the room as tall as it needs.
 * It measures the overlays only where they rest, never on their way in or out. With `hold`, a live
 * figure's, the room the overlays rest open in stays while they are closed, so what opens them
 * stays where it is as they close and open again. Returns whether the room was already made for
 * them, as they rest open: nothing changed.
 */
export function makeRoom(room: HTMLElement, layer: HTMLElement, hold: boolean) {
  const found = overlays(layer);
  if (found.some(moving) || (hold && !found.length)) return false;
  const style = getComputedStyle(room);
  // What the viewport measures is drawn at the stage's scale; the room's padding and height are
  // in its own px.
  const scale = scaleOf(stageOf(room));
  const padding = {
    top: parseFloat(style.paddingTop),
    right: parseFloat(style.paddingRight),
    bottom: parseFloat(style.paddingBottom),
    left: parseFloat(style.paddingLeft),
  };
  const content = inFlow(room, layer);
  const anchored: Box[] = [];
  let grow: number | undefined;
  for (const overlay of found) {
    if (placedOnStage(overlay, layer)) {
      const height = content.length ? union(content).bottom - union(content).top : 0;
      grow = Math.max(grow ?? -Infinity, shortfall(overlay, layer, stageOf(room), height));
    } else anchored.push(overlay.getBoundingClientRect());
  }
  const next = { top: 0, right: 0, bottom: 0, left: 0 };
  if (content.length && anchored.length) {
    const own = union(content);
    const all = union(anchored);
    next.top = Math.max(0, own.top - all.top) / scale;
    next.right = Math.max(0, all.right - own.right) / scale;
    next.bottom = Math.max(0, all.bottom - own.bottom) / scale;
    next.left = Math.max(0, own.left - all.left) / scale;
    // The room's padding at its sides narrows what opens the popups: text, such as a sentence with
    // a link that opens a hover card, would wrap to it, move its link and the popup with it, and be
    // padded narrower again, down to a column of a word or two. What opens them keeps at least
    // the widest popup's width, so a popup about as wide as the stage leaves the text as wide.
    // What is narrower than the room has left it, such as a menu's trigger, is at its own width
    // and keeps only that, with a pixel to spare, so a popup wider than it still centres with it
    // on a narrow stage.
    const widest = Math.max(...anchored.map((box) => box.right - box.left)) / scale;
    const ownWidth = (own.right - own.left) / scale;
    const available = room.clientWidth - padding.left - padding.right;
    const keep = ownWidth < available - 1 ? Math.min(widest, ownWidth + 2) : widest;
    const spare = Math.max(0, room.clientWidth - keep);
    const sides = next.left + next.right;
    if (sides > spare) {
      next.left *= spare / sides;
      next.right *= spare / sides;
    }
  }
  // A popup is placed at whole pixels, and moving the room by a fraction of one can round it to
  // the next: padding that followed every such step would set it trembling, a pixel each frame.
  // Within a pixel, the room stays as it is.
  let changed = false;
  for (const side of ['top', 'right', 'bottom', 'left'] as const)
    if (Math.abs(next[side] - padding[side]) > 1) {
      room.style.setProperty(`padding-${side}`, `${next[side]}px`);
      changed = true;
    }
  // The room grows, or shrinks back, by what the stage lacks or has to spare.
  if (grow !== undefined && Math.abs(grow) > 0.5) {
    const height = (room.getBoundingClientRect().height + grow) / scale;
    const next = `${Math.max(0, Math.ceil(height))}px`;
    if (room.style.minBlockSize !== next) {
      room.style.minBlockSize = next;
      changed = true;
    }
  } else if (grow === undefined && room.style.minBlockSize) {
    room.style.minBlockSize = '';
    changed = true;
  }
  return found.length > 0 && !changed;
}

/**
 * Keeps an open example's stage at the height it was recorded at, its overlays resting open in it
 * (scripts/site/RecordPartSizes.ts), from as it starts loading until its room is made for them and
 * it fades in: the page below holds still as the example lands, the room grows for its overlays
 * unseen, and it appears once, at its size. The room is measured as it would be without the
 * reservation (`measured`), so it is made for the overlays alone; `release` lets the stage go to
 * its own height. A stage with no record keeps its own height throughout.
 */
export function reserveStage(room: HTMLElement, part: string | undefined) {
  const height = part === undefined ? undefined : recordedSize(part)?.[1];
  const stage = height === undefined ? null : stageOf(room);
  let held = stage !== null && stage !== room;
  // Unseen, it is that height exactly, also as the room passes through a size on its way to the
  // one it is made at, such as a popup placed for a frame where it doesn't rest; shown, at least.
  let unseen = true;
  const hold = () => {
    stage!.style.minBlockSize = `${height}rem`;
    stage!.style.blockSize = unseen ? `${height}rem` : '';
  };
  const free = () => {
    stage!.style.minBlockSize = '';
    stage!.style.blockSize = '';
  };
  if (held) hold();
  return {
    measured<T>(measure: () => T): T {
      if (!held) return measure();
      free();
      try {
        return measure();
      } finally {
        hold();
      }
    },
    /** The room shows before it is made: the stage grows with it, if it must, from then on. */
    shown() {
      unseen = false;
      if (held) hold();
    },
    release() {
      if (!held) return;
      held = false;
      free();
    },
  };
}
