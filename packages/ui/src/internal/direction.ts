import type { Direction } from './EnvUIContext.js';

/**
 * The element's computed text direction, which follows dir attributes and CSS alike. Reading it
 * brings styles up to date; a component that renders by the direction takes useDirection instead.
 */
export const computedDirection = (element: Element): Direction =>
  getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';

/** Whether the element's computed text direction is right to left. */
export const isRightToLeft = (element: Element) => computedDirection(element) === 'rtl';
