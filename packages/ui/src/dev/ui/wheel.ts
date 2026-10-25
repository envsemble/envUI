// How dev mode's UI decides what the wheel scrolls: the 3D view scrolls the page under the pointer
// itself, and the panel keeps the wheel from reaching the page it covers.

/**
 * Whether an element scrolls on the wheel's axis: 'room' where it can go further the wheel's way,
 * 'end' where it is at its end that way, else null.
 */
export function scrollsToward(element: Element, dx: number, dy: number): 'room' | 'end' | null {
  const style = getComputedStyle(element);
  const axis = (overflow: string, delta: number, at: number, most: number) => {
    if (delta === 0 || !/auto|scroll/.test(overflow) || most <= 1) return null;
    return (delta > 0 ? at < most - 1 : at > 0) ? 'room' : 'end';
  };
  const y = axis(
    style.overflowY,
    dy,
    element.scrollTop,
    element.scrollHeight - element.clientHeight,
  );
  const x = axis(
    style.overflowX,
    dx,
    element.scrollLeft,
    element.scrollWidth - element.clientWidth,
  );
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
 * Keeps the wheel over an element from scrolling what is around it: where nothing between the
 * pointer and the element scrolls the wheel's way, the wheel stops there. A scroller inside still
 * scrolls. CSS's overscroll-behavior would do it only where the element can scroll itself, and
 * not in every browser. Ctrl+wheel, the browser's zoom, passes. Returns what removes it.
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
