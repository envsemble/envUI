/*
 * The motion tokens as the page's root sets them, for motion the site starts from script. It reads
 * them with the library's helpers, on the document's root, so a theme that changes a token also
 * changes the site's scripted motion. Outside a browser, where there is no root, nothing animates.
 */
import {
  easingFunction,
  motionDuration,
  motionEasing,
  type MotionDuration,
  type MotionEasing,
} from '@envui-internal/internal/motion/motionTokens';

const root = () => (typeof document === 'undefined' ? null : document.documentElement);

/**
 * A duration token on the page's root, in milliseconds, such as `--env-motion-duration-fast`, for a
 * timer that waits for a transition the site starts.
 */
export function rootMotionDuration(speed: MotionDuration) {
  const element = root();
  return element ? motionDuration(element, speed) : 0;
}

/** An easing token on the page's root as it is written, or `ease` where it is unset. */
const rootEasing = (name: MotionEasing) => {
  const element = root();
  return element ? motionEasing(element, name) : 'ease';
};

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
