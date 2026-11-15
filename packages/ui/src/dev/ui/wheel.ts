import { layoutAttribute } from '../elements.js';
import { overlayCandidateSelector } from '../overlays.js';
import { prefersReducedMotion } from '../../internal/motion/reducedMotion.js';

function scrollsToward(element: Element, dx: number, dy: number): 'room' | 'end' | null {
  const mostY = element.scrollHeight - element.clientHeight;
  const mostX = element.scrollWidth - element.clientWidth;
  const nothingToScrollThatWay = (dy === 0 || mostY <= 1) && (dx === 0 || mostX <= 1);
  if (nothingToScrollThatWay) return null;
  const style = getComputedStyle(element);
  const axis = (overflow: string, delta: number, at: number, most: number) => {
    if (delta === 0 || !/auto|scroll/.test(overflow) || most <= 1) return null;
    return (delta > 0 ? at < most - 1 : at > 0) ? 'room' : 'end';
  };
  const y = axis(style.overflowY, dy, element.scrollTop, mostY);
  const x = axis(style.overflowX, dx, element.scrollLeft, mostX);
  return y === 'room' || x === 'room' ? 'room' : (y ?? x);
}

const pxPerWheelLine = 16;
const pxPerWheelPage = 400;

export function wheelDelta(event: WheelEvent): { dx: number; dy: number } {
  const unit =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? pxPerWheelLine
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? pxPerWheelPage
        : 1;
  const shiftTurnsVerticalWheelSideways = event.shiftKey && event.deltaX === 0;
  return {
    dx: (shiftTurnsVerticalWheelSideways ? event.deltaY : event.deltaX) * unit,
    dy: (shiftTurnsVerticalWheelSideways ? 0 : event.deltaY) * unit,
  };
}

export function scrollerAt(
  element: HTMLElement,
  root: HTMLElement,
  dx: number,
  dy: number,
): HTMLElement | 'end' | null {
  const inPage = root.contains(element);
  const scrollsNothingAround = inPage
    ? root
    : (element.closest<HTMLElement>(overlayCandidateSelector) ?? element);
  const candidates: HTMLElement[] = [element];
  const ownContentWithoutInnerNodes = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) =>
      (node as Element).hasAttribute(layoutAttribute)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  for (
    let node = ownContentWithoutInnerNodes.nextNode();
    node;
    node = ownContentWithoutInnerNodes.nextNode()
  )
    if (node instanceof HTMLElement) candidates.push(node);
  for (let at = element; at !== scrollsNothingAround && at.parentElement; at = at.parentElement)
    candidates.push(at.parentElement);
  const page = document.scrollingElement;
  if (inPage && page instanceof HTMLElement && !candidates.includes(page)) candidates.push(page);
  let somethingAtItsEnd = false;
  for (const candidate of candidates) {
    const scrolls = scrollsToward(candidate, dx, dy);
    if (scrolls === 'room') return candidate;
    if (scrolls === 'end') somethingAtItsEnd = true;
  }
  return somethingAtItsEnd ? 'end' : null;
}

const glidesInProgress = new Map<Element, { x: number; y: number; frame: number }>();

const glideFractionPerFrame = 0.25;

export function glideScrollBy(element: HTMLElement, dx: number, dy: number) {
  const gliding = glidesInProgress.get(element);
  const touchpadSizedTurn = Math.abs(dx) < 40 && Math.abs(dy) < 40;
  if (!gliding && (touchpadSizedTurn || prefersReducedMotion())) {
    element.scrollBy(dx, dy);
    return;
  }
  const clampTo = (value: number, most: number) => Math.max(0, Math.min(most, value));
  const target = gliding ?? { x: element.scrollLeft, y: element.scrollTop, frame: 0 };
  target.x = clampTo(target.x + dx, element.scrollWidth - element.clientWidth);
  target.y = clampTo(target.y + dy, element.scrollHeight - element.clientHeight);
  if (gliding) return;
  glidesInProgress.set(element, target);
  const step = () => {
    const left = target.x - element.scrollLeft;
    const top = target.y - element.scrollTop;
    if (Math.abs(left) < 1 && Math.abs(top) < 1) {
      element.scrollTo(target.x, target.y);
      glidesInProgress.delete(element);
      return;
    }
    element.scrollTo(
      element.scrollLeft + left * glideFractionPerFrame,
      element.scrollTop + top * glideFractionPerFrame,
    );
    target.frame = requestAnimationFrame(step);
  };
  target.frame = requestAnimationFrame(step);
}

export function containWheelWhereOverscrollBehaviorFallsShort(element: HTMLElement): () => void {
  const wheel = (event: WheelEvent) => {
    const browserZoom = event.ctrlKey || event.metaKey;
    if (event.defaultPrevented || browserZoom) return;
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
