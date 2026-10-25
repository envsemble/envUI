// The wheel in dev mode's UI: what it scrolls in the page under the 3D view, how it glides there
// as the browser's own smooth scrolling does, and how the panel keeps it from reaching the page
// it covers.

import { layoutAttribute, overlaySelector } from '../measure.js';
import { prefersReducedMotion } from './motion.js';

/**
 * Whether an element scrolls on the wheel's axis: 'room' where it can go further the wheel's way,
 * 'end' where it is at its end that way, else null. The sizes are read first, so an element with
 * nothing to scroll costs no style lookup.
 */
export function scrollsToward(element: Element, dx: number, dy: number): 'room' | 'end' | null {
  const mostY = element.scrollHeight - element.clientHeight;
  const mostX = element.scrollWidth - element.clientWidth;
  if ((dy === 0 || mostY <= 1) && (dx === 0 || mostX <= 1)) return null;
  const style = getComputedStyle(element);
  const axis = (overflow: string, delta: number, at: number, most: number) => {
    if (delta === 0 || !/auto|scroll/.test(overflow) || most <= 1) return null;
    return (delta > 0 ? at < most - 1 : at > 0) ? 'room' : 'end';
  };
  const y = axis(style.overflowY, dy, element.scrollTop, mostY);
  const x = axis(style.overflowX, dx, element.scrollLeft, mostX);
  return y === 'room' || x === 'room' ? 'room' : (y ?? x);
}

/** The wheel's turn in px, Shift turning a vertical wheel sideways, as browsers do. */
export function wheelDelta(event: WheelEvent): { dx: number; dy: number } {
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
  const sideways = event.shiftKey && event.deltaX === 0;
  return {
    dx: (sideways ? event.deltaY : event.deltaX) * unit,
    dy: (sideways ? 0 : event.deltaY) * unit,
  };
}

/**
 * What the wheel scrolls over a node, as a browser would under the pointer: a scroller of the
 * node's own content, else the nearest around it up to the root, else the window; one at its end
 * passes the wheel on. Never what is around the root, which the view doesn't show; an open
 * overlay's node scrolls only within the overlay. 'end' where all that scrolls there is at its
 * end, null where nothing does. The node's own content is walked without the nodes inside it,
 * which have planes of their own.
 */
export function scrollerAt(
  element: HTMLElement,
  root: HTMLElement,
  dx: number,
  dy: number,
): HTMLElement | 'end' | null {
  const inPage = root.contains(element);
  const limit = inPage ? root : (element.closest<HTMLElement>(overlaySelector) ?? element);
  const candidates: HTMLElement[] = [element];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) =>
      (node as Element).hasAttribute(layoutAttribute)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode())
    if (node instanceof HTMLElement) candidates.push(node);
  for (let at = element; at !== limit && at.parentElement; at = at.parentElement)
    candidates.push(at.parentElement);
  const page = document.scrollingElement;
  if (inPage && page instanceof HTMLElement && !candidates.includes(page)) candidates.push(page);
  let end = false;
  for (const candidate of candidates) {
    const scrolls = scrollsToward(candidate, dx, dy);
    if (scrolls === 'room') return candidate;
    if (scrolls === 'end') end = true;
  }
  return end ? 'end' : null;
}

/** Where each element the wheel scrolls is gliding to, and its animation frame. */
const glides = new Map<Element, { x: number; y: number; frame: number }>();

/**
 * Scrolls an element by the wheel's turn, gliding there over a few frames as a browser's smooth
 * scrolling does, so a mouse wheel's notches don't jump; turns that come while it glides add to
 * where it goes. A touchpad's small, frequent turns, and a reduced-motion preference, scroll at
 * once.
 */
export function glideScrollBy(element: HTMLElement, dx: number, dy: number) {
  const gliding = glides.get(element);
  const small = Math.abs(dx) < 40 && Math.abs(dy) < 40;
  if (!gliding && (small || prefersReducedMotion())) {
    element.scrollBy(dx, dy);
    return;
  }
  const clampTo = (value: number, most: number) => Math.max(0, Math.min(most, value));
  const target = gliding ?? { x: element.scrollLeft, y: element.scrollTop, frame: 0 };
  target.x = clampTo(target.x + dx, element.scrollWidth - element.clientWidth);
  target.y = clampTo(target.y + dy, element.scrollHeight - element.clientHeight);
  if (gliding) return;
  glides.set(element, target);
  const step = () => {
    const left = target.x - element.scrollLeft;
    const top = target.y - element.scrollTop;
    if (Math.abs(left) < 1 && Math.abs(top) < 1) {
      element.scrollTo(target.x, target.y);
      glides.delete(element);
      return;
    }
    // A quarter of the way each frame: quick at first, easing in to where it goes.
    element.scrollTo(element.scrollLeft + left * 0.25, element.scrollTop + top * 0.25);
    target.frame = requestAnimationFrame(step);
  };
  target.frame = requestAnimationFrame(step);
}

/**
 * Keeps the wheel over an element from scrolling what is around it: where nothing between the
 * pointer and the element scrolls the wheel's way, the wheel stops there. A scroller inside still
 * scrolls, with the browser's own smooth scrolling. CSS's overscroll-behavior does it alone only
 * in some browsers, and only where the element can scroll itself. Ctrl+wheel, the browser's zoom,
 * passes. Returns what removes it.
 */
export function containWheel(element: HTMLElement): () => void {
  const wheel = (event: WheelEvent) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;
    const { dx, dy } = wheelDelta(event);
    for (
      let at = event.target instanceof Element ? event.target : null;
      at && at !== element;
      at = at.parentElement
    )
      if (scrollsToward(at, dx, dy) === 'room') return;
    event.preventDefault();
  };
  element.addEventListener('wheel', wheel, { passive: false });
  return () => element.removeEventListener('wheel', wheel);
}
