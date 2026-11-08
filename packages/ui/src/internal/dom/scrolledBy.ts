/**
 * How far the boxes that scroll around an element, the page among them, have scrolled it along an
 * axis, in CSS pixels. A drag that adds it to the pointer's position in the viewport measures where
 * the pointer is on the content: a box that scrolls under a pointer held still moves the drag on,
 * and a pointer carried along with the content, as by a finger, moves it nowhere.
 */
export function scrolledBy(element: Element, axis: 'x' | 'y'): number {
  let total = 0;
  for (let node = element.parentElement; node; node = node.parentElement)
    total += axis === 'y' ? node.scrollTop : node.scrollLeft;
  return total;
}
