import type { Box } from './FitGeometry';
import { pixelTolerance } from '../shared/Remeasure';

export const overlayLayer = '.catalogue-overlay-layer';

export const inPopup = (element: Element) => element.closest(overlayLayer) !== null;

export function elementsOf(canvas: Element, selector: string) {
  try {
    return [...canvas.querySelectorAll(selector)];
  } catch {
    return [];
  }
}

const clippedAway = (style: CSSStyleDeclaration) => /^inset\((50|100)%/.test(style.clipPath);

export const moving = (element: Element) =>
  element.closest('[data-starting-style], [data-ending-style]') !== null ||
  (element.getAnimations?.().length ?? 0) > 0;

export function settling(element: Element, canvas: Element) {
  if (element.closest('[data-starting-style], [data-ending-style]')) return true;
  for (let node: Element | null = element; node && node !== canvas; node = node.parentElement) {
    const ends = (node.getAnimations?.() ?? []).some(
      (animation) =>
        animation.playState === 'running' &&
        animation.effect?.getComputedTiming().iterations !== Infinity,
    );
    if (ends) return true;
  }
  return false;
}

export const pictures = /^(img|svg|canvas|video|input|textarea|select|hr)$/i;

const paintsNothing = (color: string) =>
  color === 'transparent' || /^rgba\([^)]*,\s*0\s*\)$/.test(color) || /\/\s*0%?\s*\)$/.test(color);

/** @internal */
export function paintsOf(style: CSSStyleDeclaration): string[] {
  const paints: string[] = [];
  if (!paintsNothing(style.backgroundColor)) paints.push(`background ${style.backgroundColor}`);
  if (style.backgroundImage !== 'none') paints.push('a background image');
  const sides = (['top', 'right', 'bottom', 'left'] as const).filter(
    (side) =>
      (parseFloat(style.getPropertyValue(`border-${side}-width`)) || 0) > 0 &&
      !['none', 'hidden'].includes(style.getPropertyValue(`border-${side}-style`)) &&
      !paintsNothing(style.getPropertyValue(`border-${side}-color`)),
  );
  if (sides.length) paints.push(`a border (${sides.join(', ')})`);
  if (style.boxShadow !== 'none') paints.push('a shadow');
  return paints;
}

function paints(element: Element, style: CSSStyleDeclaration) {
  if (pictures.test(element.localName) || paintsOf(style).length) return true;
  return [...element.childNodes].some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
}

function within(box: DOMRect, clip: DOMRect | null) {
  if (!clip) return box;
  const left = Math.max(box.left, clip.left);
  const top = Math.max(box.top, clip.top);
  const right = Math.min(box.right, clip.right);
  const bottom = Math.min(box.bottom, clip.bottom);
  return new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
}

export interface Shown {
  element: Element;
  box: DOMRect;
}

export function shownBoxes(canvas: HTMLElement) {
  const frame = canvas.getBoundingClientRect();
  const scale = frame.width / canvas.offsetWidth || 1;
  const area = { width: canvas.offsetWidth, height: canvas.offsetHeight };
  const found: Shown[] = [];
  const visit = (element: Element, clip: DOMRect | null) => {
    for (const child of element.children) {
      const style = getComputedStyle(child);
      if (style.display === 'none' || clippedAway(style)) continue;
      if (style.opacity === '0' && !moving(child)) continue;
      if (style.visibility === 'hidden' && !child.closest('[data-catalogue-past]')) continue;
      const rect = child.getBoundingClientRect();
      const box = within(
        new DOMRect(
          (rect.left - frame.left) / scale,
          (rect.top - frame.top) / scale,
          rect.width / scale,
          rect.height / scale,
        ),
        clip,
      );
      const covers =
        box.width >= area.width - 1 &&
        box.height >= area.height - 1 &&
        /absolute|fixed/.test(style.position);
      if (
        box.width > pixelTolerance &&
        box.height > pixelTolerance &&
        !covers &&
        paints(child, style)
      )
        found.push({ element: child, box });
      for (const node of child.childNodes) {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const drawn = range.getBoundingClientRect();
        const text = within(
          new DOMRect(
            (drawn.left - frame.left) / scale,
            (drawn.top - frame.top) / scale,
            drawn.width / scale,
            drawn.height / scale,
          ),
          clip,
        );
        if (text.width > 1 && text.height > 1) found.push({ element: child, box: text });
      }
      const clips = style.overflowX !== 'visible' || style.overflowY !== 'visible';
      if (!pictures.test(child.localName)) visit(child, clips ? box : clip);
    }
  };
  visit(canvas, null);
  return found;
}

export function partOf(element: Element, canvas: HTMLElement): Box {
  const frame = canvas.getBoundingClientRect();
  const ratio = frame.width / canvas.offsetWidth || 1;
  const ownBox = (node: Element): Box => {
    const rect = node.getBoundingClientRect();
    return {
      left: (rect.left - frame.left) / ratio,
      top: (rect.top - frame.top) / ratio,
      right: (rect.right - frame.left) / ratio,
      bottom: (rect.bottom - frame.top) / ratio,
    };
  };
  let box = ownBox(element);
  for (let node = element.parentElement; node && node !== canvas; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
    const clip = ownBox(node);
    box = {
      left: Math.max(box.left, clip.left),
      top: Math.max(box.top, clip.top),
      right: Math.min(box.right, clip.right),
      bottom: Math.min(box.bottom, clip.bottom),
    };
  }
  return box;
}

export function laidOutOf(element: Element, canvas: HTMLElement): Box | null {
  if (!(element instanceof HTMLElement)) return null;
  const holder = element.offsetParent;
  const style = getComputedStyle(element);
  const moved = [style.transform, style.translate, style.rotate, style.scale].some(
    (value) => value !== 'none',
  );
  if (!moved || !(holder instanceof HTMLElement) || !canvas.contains(holder)) return null;
  const frame = canvas.getBoundingClientRect();
  const ratio = frame.width / canvas.offsetWidth || 1;
  const around = holder.getBoundingClientRect();
  const left = (around.left - frame.left) / ratio + holder.clientLeft - holder.scrollLeft;
  const top = (around.top - frame.top) / ratio + holder.clientTop - holder.scrollTop;
  return {
    left: left + element.offsetLeft,
    top: top + element.offsetTop,
    right: left + element.offsetLeft + element.offsetWidth,
    bottom: top + element.offsetTop + element.offsetHeight,
  };
}

export function inkOf(element: Element, canvas: HTMLElement): Box {
  const box = partOf(element, canvas);
  if (!element.textContent?.trim()) return box;
  const frame = canvas.getBoundingClientRect();
  const ratio = frame.width / canvas.offsetWidth || 1;
  const range = document.createRange();
  range.selectNodeContents(element);
  const text = range.getBoundingClientRect();
  return {
    left: Math.max(box.left, (text.left - frame.left) / ratio),
    top: Math.max(box.top, (text.top - frame.top) / ratio),
    right: Math.min(box.right, (text.right - frame.left) / ratio),
    bottom: Math.min(box.bottom, (text.bottom - frame.top) / ratio),
  };
}

export function rowsAfter(element: Element, canvas: HTMLElement): Box[] {
  const rows: Box[] = [];
  let row = element.closest('tr, .env-time-list-row')?.nextElementSibling;
  while (row && rows.length < 2 && canvas.contains(row) && row.checkVisibility()) {
    rows.push(partOf(row, canvas));
    row = row.nextElementSibling;
  }
  return rows;
}
