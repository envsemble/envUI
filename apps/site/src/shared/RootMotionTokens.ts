/*
 * The motion tokens as the page's root sets them, for motion the site starts from script: the
 * library's reading of them, on the document's root, so a theme that changes a token changes the
 * site's script motion with it. Outside a browser, where there is no root, nothing animates.
 */
import {
  easingFunction,
  motionDuration,
  motionEasing,
  type MotionDuration,
  type MotionEasing,
} from '@envui-internal/internal/motionTokens';

const root = () => (typeof document === 'undefined' ? null : document.documentElement);

/**
 * A duration token on the page's root in milliseconds, such as `--env-motion-duration-fast`, for a
 * timer that waits for a transition the site starts.
 */
export function rootMotionDuration(speed: MotionDuration) {
  const element = root();
  return element ? motionDuration(element, speed) : 0;
}

/** An easing token on the page's root as it is written, `ease` where it is unset. */
const rootEasing = (name: MotionEasing) => {
  const element = root();
  return element ? motionEasing(element, name) : 'ease';
};

/**
 * An easing token as CSS, for an animation the site starts from script, such as `element.animate`:
 * the token's own value, any CSS easing, such as `linear` or `steps(4)`; `ease` where it is unset or
 * no easing.
 */
export function rootMotionEasing(name: MotionEasing = 'ease') {
  const value = rootEasing(name);
  return typeof CSS !== 'undefined' && CSS.supports('animation-timing-function', value)
    ? value
    : 'ease';
}

/**
 * An easing token as a function from the share of the time gone, 0 to 1, to the share of the way,
 * for motion the site steps itself frame by frame: the cubic Bézier curve the token sets or its
 * keyword names; for another easing, such as `steps()`, `ease`'s.
 */
export const rootEasingFunction = (name: MotionEasing = 'ease') => easingFunction(rootEasing(name));
