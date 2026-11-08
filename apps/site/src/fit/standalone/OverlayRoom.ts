/*
 * Makes space in an open example's figure for the overlays that rest open in it (OpenExample.tsx).
 * The example's "room" is the element that holds it and its overlay layer. makeRoom pads the room
 * so a popup and its trigger are centred together, and makes it taller for a dialog, a sheet or a
 * toast placed on the stage. reserveStage holds the stage at its recorded height while that
 * happens.
 */
import { inset, union, type Box } from '../FitGeometry';
import { pixelTolerance } from '../../shared/Remeasure';

/**
 * The element the figure's dialogs, sheets and toasts are placed in. Usually the stage. In an
 * anatomy figure, the room (it has layout containment), which keeps them clear of the stage's
 * padding where the callouts go. In a do or don't figure's square, the box over it that is drawn
 * smaller to fit (useVerdictFit.ts).
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
 * The scale an element is drawn at, such as a do or don't figure's box drawn smaller to fit its
 * square. Dividing a viewport measurement by it gives the element's own px.
 */
const scaleOf = (element: HTMLElement) =>
  (element.offsetWidth && element.getBoundingClientRect().width / element.offsetWidth) || 1;

/**
 * The overlays open in a layer: the outermost visible elements, skipping any backdrop or fixed
 * positioner that covers the whole stage (its children are checked instead).
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
      // A backdrop or a positioner is fixed and covers the stage; what it holds is the overlay,
      // even when that also fills the stage, such as a sheet in a narrow figure.
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
 * beside its anchor, as a popup is. True when its nearest positioned ancestor within the layer is
 * fixed.
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
 * How much taller an overlay would be at its content's full height. A dialog's height may be
 * capped at the stage's, with a list in it scrolling. makeRoom grows the figure by this, run
 * after run, until nothing is cut off.
 */
function cutOff(overlay: HTMLElement) {
  const cut = (element: HTMLElement) => Math.max(0, element.scrollHeight - element.clientHeight);
  let inner = 0;
  for (const element of overlay.querySelectorAll<HTMLElement>('*'))
    if (/auto|scroll/.test(getComputedStyle(element).overflowY))
      inner = Math.max(inner, cut(element));
  return cut(overlay) + inner;
}

/** The fixed ancestor that places an overlay, such as a dialog's positioner; undefined if none. */
function placerOf(overlay: HTMLElement, layer: HTMLElement) {
  for (let node = overlay.parentElement; node && node !== layer; node = node.parentElement)
    if (getComputedStyle(node).position === 'fixed') return node;
  return undefined;
}

/**
 * Where on the stage an overlay sits: `start`, `end`, `center` or `stretch`. Read from its
 * positioner's `align-items`; for an overlay that places itself, such as a toast, from its
 * `data-placement` or `data-side`, else from which edge is nearer (`gaps`, above and below).
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
 * An overlay placed on the stage, as shortfall reads it, in viewport px: its full `height`, the
 * stage's `above` and `below` it and the stage's own `area` height, where it sits (`side`), the
 * space the stage keeps around it (`space`, the stage's padding, at least the inset), the gaps its
 * positioner keeps on its far sides (`gaps`), and the room's content height for a toast, which has
 * no positioner (`content`, else 0).
 */
interface OnStage {
  height: number;
  above: number;
  below: number;
  area: number;
  side: ReturnType<typeof placement>;
  space: number;
  gaps: { top: number; bottom: number };
  content: number;
}

/**
 * How much taller the stage must grow for an overlay placed on it, in viewport px (negative when
 * it is taller than needed). The stage needs the overlay's full height, plus a space:
 * - on both sides of a centred overlay;
 * - on the far side of one placed at an edge, such as a palette near the top or a toast at the
 *   bottom, which keeps its own gap at its edge. If its positioner keeps a gap on the far side,
 *   such as the space above a bottom sheet, the stage makes space for that too;
 * - none for a sheet that stretches to the stage's height.
 * A toast also leaves the room's content, centred, clear of it.
 * @internal
 */
export function stageShortfall({
  height,
  above,
  below,
  area,
  side,
  space,
  gaps,
  content,
}: OnStage) {
  let needed = {
    start: above + height + Math.max(space, gaps.bottom),
    end: Math.max(space, gaps.top) + height + below,
    center: height + 2 * space,
    stretch: height,
  }[side];
  if (content && (side === 'start' || side === 'end'))
    needed = Math.max(needed, content + 2 * (space + height + Math.min(above, below)));
  return needed - area;
}

/** How much taller the stage must grow for an overlay placed on it (stageShortfall). */
function shortfall(overlay: HTMLElement, layer: HTMLElement, stage: HTMLElement, content: number) {
  const box = overlay.getBoundingClientRect();
  const area = stage.getBoundingClientRect();
  const scale = scaleOf(stage);
  const above = box.top - area.top;
  const below = area.bottom - box.bottom;
  const placer = placerOf(overlay, layer);
  const placerStyle = placer && getComputedStyle(placer);
  const gap = (length: string | undefined) => (parseFloat(length ?? '') || 0) * scale;
  return stageShortfall({
    height: box.height + cutOff(overlay),
    above,
    below,
    area: area.height,
    side: placement(overlay, placer, [above, below]),
    space: Math.max(inset, parseFloat(getComputedStyle(stage).paddingTop)) * scale,
    gaps: { top: gap(placerStyle?.paddingTop), bottom: gap(placerStyle?.paddingBottom) },
    content: placer ? 0 : content,
  });
}

/**
 * The boxes of the room's children in normal flow, which hold what opens the overlays. Skips the
 * overlay layer and positioned children, such as the focus guards beside a trigger.
 */
function inFlow(room: HTMLElement, layer: Element) {
  return [...room.children]
    .filter((child) => child !== layer && !/absolute|fixed/.test(getComputedStyle(child).position))
    .map((child) => child.getBoundingClientRect())
    .filter((box) => box.width || box.height);
}

/**
 * The box of what opens a figure's popups, such as a select's field, when its popups open beside
 * it rather than on the stage; undefined otherwise. An anatomy figure's callouts keep clear of it.
 */
export function openerBox(subject: HTMLElement): Box | undefined {
  const room = subject.querySelector<HTMLElement>('.catalogue-open-example');
  const layer = room?.querySelector<HTMLElement>('.catalogue-overlay-layer');
  if (!room || !layer) return undefined;
  const found = overlays(layer);
  if (!found.length || found.some((overlay) => placedOnStage(overlay, layer))) return undefined;
  const content = inFlow(room, layer);
  return content.length ? union(content) : undefined;
}

/**
 * Whether an overlay is entering or leaving, or runs an animation or transition that ends
 * (endless ones, such as a spinner's, do not count). Its box is then not where it will rest.
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

/** A box's padding on each side, in px. */
interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * The room's padding, in its own px, that centres the popups beside their trigger with what opens
 * them: on each side, as far as the popups reach past the room's content (`own`). The boxes are in
 * viewport px, at the stage's `scale`; `width` is the room's width inside its borders and `padding`
 * its padding now.
 *
 * Side padding narrows what opens the popups. Text, such as a sentence with a link that opens a
 * hover card, would rewrap, move the link and the popup, and get padded narrower again, down to a
 * column of a word or two. So the content keeps at least the widest popup's width (`keep`), and a
 * popup about as wide as the stage leaves the text as wide. Content narrower than the room's
 * space, such as a menu's trigger, keeps only its own width plus 2 px, so a popup wider than it
 * still centres with it on a narrow stage. The side padding is scaled down to fit what is left
 * (`spare`).
 * @internal
 */
export function popupPadding(
  own: Box,
  anchored: Box[],
  scale: number,
  width: number,
  padding: Sides,
) {
  const all = union(anchored);
  const next = {
    top: Math.max(0, own.top - all.top) / scale,
    right: Math.max(0, all.right - own.right) / scale,
    bottom: Math.max(0, all.bottom - own.bottom) / scale,
    left: Math.max(0, own.left - all.left) / scale,
  };
  const widest = Math.max(...anchored.map((box) => box.right - box.left)) / scale;
  const ownWidth = (own.right - own.left) / scale;
  const available = width - padding.left - padding.right;
  const keep = ownWidth < available - 1 ? Math.min(widest, ownWidth + 2) : widest;
  const spare = Math.max(0, width - keep);
  const sides = next.left + next.right;
  if (sides > spare) {
    next.left *= spare / sides;
    next.right *= spare / sides;
  }
  return next;
}

/**
 * Makes space in the figure for its open overlays, and centres them with what opens them:
 * - a popup beside its trigger adds padding to the room on the popup's side, so the two together
 *   sit in the middle of the stage;
 * - a dialog, a sheet or a toast placed on the stage makes the room as tall as it needs.
 * It measures the overlays only while they rest, never while they enter or leave. With `hold`
 * (a live figure), the space stays while the overlays are closed, so their trigger stays in place
 * as they close and open again.
 *
 * Returns true when overlays are open and nothing had to change, so the room is ready.
 */
export function makeRoom(room: HTMLElement, layer: HTMLElement, hold: boolean) {
  const found = overlays(layer);
  if (found.some(moving) || (hold && !found.length)) return false;
  const style = getComputedStyle(room);
  // Viewport measurements are at the stage's scale; the room's padding and height are in its own
  // px.
  const scale = scaleOf(stageOf(room));
  const padding: Sides = {
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
  const next =
    content.length && anchored.length
      ? popupPadding(union(content), anchored, scale, room.clientWidth, padding)
      : { top: 0, right: 0, bottom: 0, left: 0 };
  // A popup is placed at whole pixels, and moving the room by a fraction of one can round the
  // popup to the next pixel. Padding that followed every such step would tremble a pixel each
  // frame, so a change of 1 px or less is ignored.
  let changed = false;
  for (const side of ['top', 'right', 'bottom', 'left'] as const)
    if (Math.abs(next[side] - padding[side]) > 1) {
      room.style.setProperty(`padding-${side}`, `${next[side]}px`);
      changed = true;
    }
  // The room grows, or shrinks back, by what the stage lacks or has to spare (shortfall).
  if (grow !== undefined && Math.abs(grow) > pixelTolerance) {
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
 * Holds an open example's stage at its recorded `height`, in rem (the height with its overlays
 * resting open, recorded by scripts/site/RecordPartSizes.ts), from when it starts loading until
 * its room is made and it fades in. The page below stays still as the example loads, the room
 * grows for its overlays unseen, and the example appears once, at its final size. A stage with no
 * recorded height is not held.
 *
 * Returns:
 * - `measured(fn)`: runs `fn` with the hold lifted, so the room is measured for the overlays
 *   alone, then puts the hold back;
 * - `shown()`: call when the room shows; from then on the stage may grow past the recorded height;
 * - `release()`: lets the stage go to its own height.
 */
export function reserveStage(room: HTMLElement, height: number | undefined) {
  const stage = height === undefined ? null : stageOf(room);
  let held = stage !== null && stage !== room;
  // Before it shows, the stage is exactly the recorded height, even while the room passes through
  // other sizes, such as a popup placed for one frame where it does not rest. After it shows, the
  // recorded height is a minimum.
  let unseen = true;
  const hold = () => {
    if (!stage) return;
    stage.style.minBlockSize = `${height}rem`;
    stage.style.blockSize = unseen ? `${height}rem` : '';
  };
  const free = () => {
    if (!stage) return;
    stage.style.minBlockSize = '';
    stage.style.blockSize = '';
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
    /** The room is showing: from now on the stage may grow past the recorded height. */
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
