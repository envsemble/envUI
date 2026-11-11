/*
 * The motion tokens as the page's root sets them, for motion the site starts from script. It reads
 * them with the library's helpers, on the document's root, so a theme that changes a token also
 * changes the site's scripted motion. Outside a browser, where there is no root, nothing animates.
 *
 * Each token is read once and kept until an attribute of the root changes, as a theme's does: the
 * token sheet sets them on the root, and reading the root's style works out the style of the whole
 * page wherever it changed, a long pause each time motion starts while the page loads or a tile
 * plays.
 */
import {
  easingFunction,
  motionDuration,
  motionEasing,
  type MotionDuration,
  type MotionEasing,
} from '@envui-internal/internal/motion/motionTokens';

const root = () => (typeof document === 'undefined' ? null : document.documentElement);

/** The tokens read since the root's attributes last changed, by name. */
const kept = new Map<string, number | string>();
/** Watches the root's attributes, from the first token read on. */
let rootChanges: MutationObserver | null = null;

/**
 * A token of the root, read with `read` or kept from before. The root's changes are taken as the
 * token is read, so a token read just after a theme changed is read anew.
 */
function rootToken<T extends number | string>(
  name: string,
  read: (element: Element) => T,
  outside: T,
): T {
  const element = root();
  if (!element) return outside;
  // Where nothing can watch the root, as in a unit test's stand-in document, read each time.
  if (typeof MutationObserver === 'undefined') return read(element);
  if (!rootChanges) {
    rootChanges = new MutationObserver(() => kept.clear());
    rootChanges.observe(element, { attributes: true });
  }
  if (rootChanges.takeRecords().length) kept.clear();
  if (!kept.has(name)) kept.set(name, read(element));
  // A name is kept only with what its own `read` returned.
  return kept.get(name) as T;
}

/**
 * A duration token on the page's root, in milliseconds, such as `--env-motion-duration-fast`, for a
 * timer that waits for a transition the site starts.
 */
export const rootMotionDuration = (speed: MotionDuration) =>
  rootToken(`duration ${speed}`, (element) => motionDuration(element, speed), 0);

/** An easing token on the page's root as it is written, or `ease` where it is unset. */
const rootEasing = (name: MotionEasing) =>
  rootToken(`easing ${name}`, (element) => motionEasing(element, name), 'ease');

/**
 * An easing token as CSS, for an animation the site starts from script, such as `element.animate`:
 * the token's own value, which may be any CSS easing, such as `linear` or `steps(4)`, or `ease`
 * where it is unset or isn't an easing.
 */
export function rootMotionEasing(name: MotionEasing = 'ease') {
  const value = rootEasing(name);
  return typeof CSS !== 'undefined' && CSS.supports('animation-timing-function', value)
    ? value
    : 'ease';
}

/**
 * An easing token as a function from the share of the time passed (0 to 1) to the share of the
 * distance covered, for motion the site steps itself frame by frame. It follows the cubic Bézier
 * curve the token sets or its keyword names; for another easing, such as `steps()`, it follows
 * `ease`.
 */
export const rootEasingFunction = (name: MotionEasing = 'ease') => easingFunction(rootEasing(name));
