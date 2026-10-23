// The readout's API, `envui.layout` in the browser: the page as text, its problems, and both at
// other widths and heights, measured synchronously.

import { measure, resolveRoot } from './measure.js';
import type { LayoutProblem } from './model.js';
import { read, type Reading } from './readout.js';
import { skeletonShift, type SkeletonShiftOptions } from './skeletonShift.js';
import { rootFontPx, toPx, windowClassOf, type WindowClass } from './units.js';

export interface LayoutOptions {
  /**
   * The element to measure, or a selector for it. Defaults to the outermost theme boundary that
   * is the `env-window` container, else the first theme boundary, else the body.
   */
  root?: Element | string;
  /**
   * Measure at this width: a px number or a length such as `'40rem'`. The root is resized for
   * the measurement and put back at once.
   */
  width?: number | string;
  /**
   * Measure at this height too, as a window of that height shows the page: the root is given the
   * block size and scrolls what is taller. A px number or a length such as `'50rem'`.
   */
  height?: number | string;
  /** The fewest characters a line of text may hold before it counts as squeezed. @default 8 */
  minTextChars?: number;
}

/** A size `at()` measures at: a width, or a width and a height, such as a device's. */
export type LayoutSize = number | string | { width: number | string; height?: number | string };

/** The readout at one width, as `at()` returns it. */
export interface LayoutAtResult {
  /** The width asked for, as given, such as `'40rem'`. */
  width: string;
  /** The height asked for, as given, if one was. */
  height?: string;
  /** The window class of that width. */
  windowClass: WindowClass;
  /** The readout, as `describe()` returns it. */
  text: string;
  /** The problems, as `check()` returns them. */
  problems: LayoutProblem[];
}

/** The readout's API, `envui.layout` in the browser. */
export interface LayoutApi {
  /** The page as text: every layout node and open overlay, then the problems. */
  describe(options?: LayoutOptions): string;
  /** The problems only; an empty list when there are none. */
  check(options?: LayoutOptions): LayoutProblem[];
  /**
   * The readout and problems at each width in turn, or each `{ width, height }`; the root's inline
   * style is put back after each. Only the root is resized: open overlays stay where they were
   * placed for the real window, which the readout's window and `overlay-off-window` still refer
   * to.
   */
  at(
    sizes: readonly LayoutSize[],
    options?: Omit<LayoutOptions, 'width' | 'height'>,
  ): LayoutAtResult[];
  /**
   * The elements of a skeleton that move or resize when it loads, as `skeleton-shift` problems:
   * it toggles the surface's skeleton state, measures every element in both and puts it back. The
   * root is a surface or a selector for one, else the page, whose skeletons it checks; run it on
   * the loaded page, so both states hold the same content.
   */
  skeletonShift(root?: Element | string, options?: SkeletonShiftOptions): LayoutProblem[];
}

/** The root's inline properties that resizing it sets, and puts back. */
const resized = [
  'inline-size',
  'width',
  'min-inline-size',
  'max-inline-size',
  'block-size',
  'height',
  'min-block-size',
  'max-block-size',
  'overflow',
  'flex',
  'box-sizing',
];

/**
 * Lays the root out at a width, and a height if one is given, in px, as `at()` measures it, until
 * the function it returns puts its inline style back as it was. Given a height, the root takes it
 * as a window would: content taller than it scrolls inside the root. Dev mode's responsive frame
 * holds it for as long as it is set.
 */
export function resizeRoot(root: HTMLElement, width: number | null, height: number | null = null) {
  const style = root.style;
  const hadStyle = root.hasAttribute('style');
  const saved = resized.map(
    (name) => [name, style.getPropertyValue(name), style.getPropertyPriority(name)] as const,
  );
  style.setProperty('box-sizing', 'border-box', 'important');
  style.setProperty('flex', 'none', 'important');
  if (width !== null) {
    style.setProperty('min-inline-size', '0', 'important');
    style.setProperty('max-inline-size', 'none', 'important');
    style.setProperty('inline-size', `${width}px`, 'important');
  }
  if (height !== null) {
    style.setProperty('min-block-size', '0', 'important');
    style.setProperty('max-block-size', 'none', 'important');
    style.setProperty('block-size', `${height}px`, 'important');
    style.setProperty('overflow', 'auto', 'important');
  }
  return () => {
    for (const [name, value, priority] of saved) {
      if (value) style.setProperty(name, value, priority);
      else style.removeProperty(name);
    }
    if (!hadStyle && !root.getAttribute('style')) root.removeAttribute('style');
  };
}

/** Resizes the root for one synchronous measurement, and puts it back. */
function atSize<T>(
  root: HTMLElement,
  width: number | string | undefined,
  height: number | string | undefined,
  run: () => T,
): T {
  if (width === undefined && height === undefined) return run();
  const px = (value: number | string | undefined) =>
    value === undefined ? null : toPx(value, rootFontPx());
  const restore = resizeRoot(root, px(width), px(height));
  try {
    return run();
  } finally {
    restore();
  }
}

/** Measures and reads the page once, at a width and height if they are given. */
export function readLayout(options: LayoutOptions = {}): Reading {
  const root = resolveRoot(options.root);
  return atSize(root, options.width, options.height, () =>
    read(measure(root, { inner: true, minTextChars: options.minTextChars })),
  );
}

/** The readout's API, `envui.layout` in the browser. */
export const layout: LayoutApi = {
  describe: (options) => readLayout(options).text,
  check: (options) => readLayout(options).problems,
  at(sizes, options = {}) {
    return sizes.map((size) => {
      const { width, height } =
        typeof size === 'object' ? size : { width: size, height: undefined };
      const reading = readLayout({ ...options, width, height });
      return {
        width: String(width),
        ...(height !== undefined && { height: String(height) }),
        windowClass: windowClassOf(toPx(width, rootFontPx()) / rootFontPx()),
        text: reading.text,
        problems: reading.problems,
      };
    });
  },
  skeletonShift,
};
