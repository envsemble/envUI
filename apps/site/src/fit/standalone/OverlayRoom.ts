import { insetPx, union, type Box } from '../FitGeometry';
import { pixelTolerance } from '../../shared/Remeasure';

const stageOf = (element: HTMLElement) => {
  const room = element.closest<HTMLElement>('.catalogue-open-example');
  if (room && getComputedStyle(room).contain.includes('layout')) return room;
  return (
    element.closest<HTMLElement>('.site-verdict[data-shape="square"] .site-verdict-fit') ??
    element.closest<HTMLElement>('.site-live-example, .site-verdict-stage, .site-anatomy-stage') ??
    element
  );
};

const scaleOf = (element: HTMLElement) =>
  (element.offsetWidth && element.getBoundingClientRect().width / element.offsetWidth) || 1;

export function overlays(layer: HTMLElement) {
  const stage = stageOf(layer);
  const scale = scaleOf(stage);
  const area = { width: stage.clientWidth * scale, height: stage.clientHeight * scale };
  const found: HTMLElement[] = [];
  const visit = (element: Element) => {
    for (const child of element.children) {
      if (!(child instanceof HTMLElement)) continue;
      const box = child.getBoundingClientRect();
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

function placedOnStage(element: HTMLElement, layer: HTMLElement) {
  for (let node: HTMLElement | null = element; node && node !== layer; node = node.parentElement) {
    const position = getComputedStyle(node).position;
    if (position === 'fixed') return true;
    if (position === 'absolute') return false;
  }
  return false;
}

function cutOff(overlay: HTMLElement) {
  const cut = (element: HTMLElement) => Math.max(0, element.scrollHeight - element.clientHeight);
  let inner = 0;
  for (const element of overlay.querySelectorAll<HTMLElement>('*'))
    if (/auto|scroll/.test(getComputedStyle(element).overflowY))
      inner = Math.max(inner, cut(element));
  return cut(overlay) + inner;
}

function placerOf(overlay: HTMLElement, layer: HTMLElement) {
  for (let node = overlay.parentElement; node && node !== layer; node = node.parentElement)
    if (getComputedStyle(node).position === 'fixed') return node;
  return undefined;
}

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

/** @internal */
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
    space: Math.max(insetPx, parseFloat(getComputedStyle(stage).paddingTop)) * scale,
    gaps: { top: gap(placerStyle?.paddingTop), bottom: gap(placerStyle?.paddingBottom) },
    content: placer ? 0 : content,
  });
}

function inFlow(room: HTMLElement, layer: Element) {
  return [...room.children]
    .filter((child) => child !== layer && !/absolute|fixed/.test(getComputedStyle(child).position))
    .map((child) => child.getBoundingClientRect())
    .filter((box) => box.width || box.height);
}

export function openerBox(subject: HTMLElement): Box | undefined {
  const room = subject.querySelector<HTMLElement>('.catalogue-open-example');
  const layer = room?.querySelector<HTMLElement>('.catalogue-overlay-layer');
  if (!room || !layer) return undefined;
  const found = overlays(layer);
  if (!found.length || found.some((overlay) => placedOnStage(overlay, layer))) return undefined;
  const content = inFlow(room, layer);
  return content.length ? union(content) : undefined;
}

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

interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const narrowContentSlackPx = 2;

/** @internal */
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
  const keep =
    ownWidth < available - 1 ? Math.min(widest, ownWidth + narrowContentSlackPx) : widest;
  const spare = Math.max(0, width - keep);
  const sides = next.left + next.right;
  if (sides > spare) {
    next.left *= spare / sides;
    next.right *= spare / sides;
  }
  return next;
}

const fullSizeScaleSlack = 0.01;

/** @internal */
export function steadyPadding(padding: Sides, scale: number): Sides {
  if (Math.abs(scale - 1) > fullSizeScaleSlack) return padding;
  const even = (length: number) => 2 * Math.floor(length / 2);
  return {
    top: even(padding.top),
    right: even(padding.right),
    bottom: even(padding.bottom),
    left: even(padding.left),
  };
}

const ignoredPaddingGrowthPx = 1;
const ignoredPaddingShrinkPx = 2;

/** @internal */
export function settledPadding(current: number, measured: number) {
  const change = measured - current;
  const ignored = change > 0 ? ignoredPaddingGrowthPx : ignoredPaddingShrinkPx;
  return Math.abs(change) > ignored ? measured : current;
}

export function makeRoom(room: HTMLElement, layer: HTMLElement, hold: boolean) {
  const found = overlays(layer);
  if (found.some(moving) || (hold && !found.length)) return false;
  const style = getComputedStyle(room);
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
      ? steadyPadding(
          popupPadding(union(content), anchored, scale, room.clientWidth, padding),
          scale,
        )
      : { top: 0, right: 0, bottom: 0, left: 0 };
  let changed = false;
  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    const settled = anchored.length ? settledPadding(padding[side], next[side]) : next[side];
    if (settled !== padding[side]) {
      room.style.setProperty(`padding-${side}`, `${settled}px`);
      changed = true;
    }
  }
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

export function reserveStage(room: HTMLElement, height: number | undefined) {
  const stage = height === undefined ? null : stageOf(room);
  let held = stage !== null && stage !== room;
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
