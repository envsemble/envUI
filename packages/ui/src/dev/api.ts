// The readout's API, `envui.layout` in the browser: the page as text, its problems, and both at
// other widths, measured synchronously.

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
  /** The fewest characters a line of text may hold before it counts as squeezed. @default 8 */
  minTextChars?: number;
}

/** The readout at one width, as `at()` returns it. */
export interface LayoutAtResult {
  /** The width asked for, as given, such as `'40rem'`. */
  width: string;
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
  /** The readout and problems at each width in turn; the root is put back after each. */
  at(
    widths: readonly (number | string)[],
    options?: Omit<LayoutOptions, 'width'>,
  ): LayoutAtResult[];
  /**
   * The elements of a skeleton that move or resize when it loads, as `skeleton-shift` problems:
   * it toggles the surface's skeleton state, measures every element in both and puts it back. The
   * root is a surface or a selector for one, else the page, whose skeletons it checks; run it on
   * the loaded page, so both states hold the same content.
   */
  skeletonShift(root?: Element | string, options?: SkeletonShiftOptions): LayoutProblem[];
}

/** Resizes the root for one synchronous measurement, and puts it back. */
function atWidth<T>(root: HTMLElement, width: number | string | undefined, run: () => T): T {
  if (width === undefined) return run();
  const style = root.style;
  const hadStyle = root.hasAttribute('style');
  const saved = [
    'inline-size',
    'width',
    'min-inline-size',
    'max-inline-size',
    'flex',
    'box-sizing',
  ].map((name) => [name, style.getPropertyValue(name), style.getPropertyPriority(name)] as const);
  const px = toPx(width, rootFontPx());
  style.setProperty('box-sizing', 'border-box', 'important');
  style.setProperty('flex', 'none', 'important');
  style.setProperty('min-inline-size', '0', 'important');
  style.setProperty('max-inline-size', 'none', 'important');
  style.setProperty('inline-size', `${px}px`, 'important');
  try {
    return run();
  } finally {
    for (const [name, value, priority] of saved) {
      if (value) style.setProperty(name, value, priority);
      else style.removeProperty(name);
    }
    if (!hadStyle && !root.getAttribute('style')) root.removeAttribute('style');
  }
}

/** Measures and reads the page once, at a width if one is given. */
export function readLayout(options: LayoutOptions = {}): Reading {
  const root = resolveRoot(options.root);
  return atWidth(root, options.width, () =>
    read(measure(root, { inner: true, minTextChars: options.minTextChars })),
  );
}

/** The readout's API, `envui.layout` in the browser. */
export const layout: LayoutApi = {
  describe: (options) => readLayout(options).text,
  check: (options) => readLayout(options).problems,
  at(widths, options = {}) {
    return widths.map((width) => {
      const reading = readLayout({ ...options, width });
      return {
        width: String(width),
        windowClass: windowClassOf(toPx(width, rootFontPx()) / rootFontPx()),
        text: reading.text,
        problems: reading.problems,
      };
    });
  },
  skeletonShift,
};
