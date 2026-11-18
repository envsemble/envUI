import { describeElement, isDevElement } from './elements.js';
import { resolveRoot, toBox } from './measure.js';
import type { Box, LayoutProblem } from './model.js';
import { partClassOf } from './parts.js';
import { remPixels } from '../internal/dom/lengths.js';
import { toRem } from './units.js';
import { alignPulses } from '../foundations/SkeletonScope.js';
import { skeletonContentClass } from '../internal/skeleton.js';

const skeletonAttribute = 'data-env-skeleton';

export interface SkeletonShiftOptions {
  /** How far, in px, an element may move or resize before it counts. @default 1 */
  tolerance?: number;
}

function labelOf(element: Element): string {
  const part = partClassOf(element);
  if (part) return part;
  const name = element.getAttribute('data-env-name');
  const kind = element.getAttribute('data-env-layout');
  if (kind) return name ? `${kind} "${name}"` : kind;
  return describeElement(element);
}

function pathOf(element: Element, surface: Element): string {
  const labels: string[] = [];
  for (let at: Element | null = element; at; at = at.parentElement) {
    if (at === element || at === surface || partClassOf(at) || at.hasAttribute('data-env-layout'))
      labels.unshift(labelOf(at));
    if (at === surface) break;
  }
  return labels.join(' > ');
}

function surfacesToToggle(root: HTMLElement): HTMLElement[] {
  if (root.hasAttribute(skeletonAttribute)) return [root];
  const inside = Array.from(root.querySelectorAll<HTMLElement>(`[${skeletonAttribute}]`)).filter(
    (element) =>
      !isDevElement(element) && !element.parentElement?.closest(`[${skeletonAttribute}]`),
  );
  return inside.length > 0 ? inside : [root];
}

function keepsItsSizeWhateverTheAspectRatio(element: HTMLElement): boolean {
  const before = element.getBoundingClientRect();
  if (before.width === 0 || before.height === 0) return false;
  const { style } = element;
  const ownAspectRatio = [
    style.getPropertyValue('aspect-ratio'),
    style.getPropertyPriority('aspect-ratio'),
  ];
  style.setProperty('aspect-ratio', '1 / 9', 'important');
  const after = element.getBoundingClientRect();
  if (ownAspectRatio[0]) style.setProperty('aspect-ratio', ownAspectRatio[0], ownAspectRatio[1]);
  else style.removeProperty('aspect-ratio');
  if (!element.getAttribute('style')) element.removeAttribute('style');
  return after.width === before.width && after.height === before.height;
}

const tagsWhoseChildrenCannotBeWrapped = new Set([
  'UL',
  'OL',
  'DL',
  'TABLE',
  'THEAD',
  'TBODY',
  'TFOOT',
  'TR',
  'SELECT',
]);

class SkeletonContentWrapper {
  private element: HTMLElement | null;
  private content: ChildNode[] = [];
  private readonly madeForLoadedSurface: boolean;

  constructor(private readonly surface: HTMLElement) {
    this.element = surface.querySelector<HTMLElement>(`:scope > .${skeletonContentClass}`);
    this.madeForLoadedSurface = this.element === null;
  }

  unwrap() {
    const element = this.element;
    if (!element?.isConnected) return;
    this.content = Array.from(element.childNodes);
    for (const node of this.content) this.surface.insertBefore(node, element);
    element.remove();
  }

  wrap() {
    if (this.element?.isConnected) return;
    if (!this.element) {
      if (tagsWhoseChildrenCannotBeWrapped.has(this.surface.tagName)) return;
      this.element = document.createElement('div');
      this.element.className = skeletonContentClass;
      this.element.inert = true;
      this.content = Array.from(this.surface.childNodes);
    }
    const first = this.content.find((node) => node.parentNode === this.surface) ?? null;
    this.surface.insertBefore(this.element, first);
    this.element.append(...this.content);
  }

  restore(wasSkeleton: boolean) {
    if (wasSkeleton && !this.madeForLoadedSurface) this.wrap();
    else this.unwrap();
  }
}

function skeletonShiftsOf(
  surface: HTMLElement,
  tolerance: number,
  rootPx: number,
): LayoutProblem[] {
  const elements = [surface, ...Array.from(surface.querySelectorAll('*'))].filter(
    (element) =>
      !isDevElement(element) &&
      !(element.parentElement === surface && element.matches(`.${skeletonContentClass}`)),
  );
  const wasSkeleton = surface.hasAttribute(skeletonAttribute);
  const wrapper = new SkeletonContentWrapper(surface);
  const measure = (skeleton: boolean) => {
    surface.toggleAttribute(skeletonAttribute, skeleton);
    if (skeleton) wrapper.wrap();
    else wrapper.unwrap();
    return elements.map((element) => toBox(element.getBoundingClientRect()));
  };
  let loaded: Box[];
  let skeleton: Box[];
  try {
    loaded = measure(false);
    skeleton = measure(true);
  } finally {
    surface.toggleAttribute(skeletonAttribute, wasSkeleton);
    wrapper.restore(wasSkeleton);
    alignPulses();
  }
  const index = new Map(elements.map((element, at) => [element, at]));
  const rem = (px: number) => `${toRem(px, rootPx)}rem`;
  const found: [Element, LayoutProblem][] = [];
  elements.forEach((element, at) => {
    const before = skeleton[at];
    const after = loaded[at];
    const dw = after.w - before.w;
    const dh = after.h - before.h;
    const parent = element === surface ? undefined : index.get(element.parentElement!);
    const parentMove =
      parent === undefined
        ? { x: 0, y: 0 }
        : { x: loaded[parent].x - skeleton[parent].x, y: loaded[parent].y - skeleton[parent].y };
    const dx = after.x - before.x - parentMove.x;
    const dy = after.y - before.y - parentMove.y;
    const resized = Math.abs(dw) > tolerance || Math.abs(dh) > tolerance;
    const moved = Math.abs(dx) > tolerance || Math.abs(dy) > tolerance;
    if (!resized && !moved) return;
    const changes: string[] = [];
    if (moved)
      changes.push(
        `moves ${[Math.abs(dx) > tolerance && `${rem(dx)} across`, Math.abs(dy) > tolerance && `${rem(dy)} down`].filter(Boolean).join(' and ')}`,
      );
    if (resized)
      changes.push(
        `changes from ${rem(before.w)}×${rem(before.h)} to ${rem(after.w)}×${rem(after.h)}`,
      );
    found.push([
      element,
      {
        rule: 'skeleton-shift',
        node: labelOf(element),
        path: pathOf(element, surface),
        message: `It ${changes.join(' and ')} when the skeleton loads, so the page shifts. Give the skeleton the size of what it stands for, such as a media element's aspect ratio or a part's skeleton length.`,
      },
    ]);
  });
  const deepestShifts = found.filter(
    ([element]) => !found.some(([other]) => other !== element && element.contains(other)),
  );
  const reported = new Set(deepestShifts.map(([element]) => element));
  const mediaWithoutAspectRatio = elements
    .filter(
      (element) =>
        !reported.has(element) &&
        element.matches('img, video, iframe') &&
        getComputedStyle(element).aspectRatio === 'auto' &&
        !keepsItsSizeWhateverTheAspectRatio(element as HTMLElement),
    )
    .map((element): LayoutProblem => ({
      rule: 'skeleton-shift',
      node: labelOf(element),
      path: pathOf(element, surface),
      message:
        'Media without an aspect ratio has no size until it loads. Declare one, with width and height attributes or aspect-ratio, so its skeleton holds its place.',
    }));
  return [...deepestShifts.map(([, problem]) => problem), ...mediaWithoutAspectRatio];
}

export function skeletonShift(
  root?: Element | string,
  { tolerance = 1 }: SkeletonShiftOptions = {},
): LayoutProblem[] {
  const element = resolveRoot(root);
  const rootPx = remPixels(element);
  return surfacesToToggle(element).flatMap((surface) =>
    skeletonShiftsOf(surface, tolerance, rootPx),
  );
}
