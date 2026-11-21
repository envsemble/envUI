/**
 * The nearest box around an element that scrolls it vertically: an ancestor whose overflow-y lets
 * it scroll and whose content overflows it. Null when there is none.
 */
export function verticalScrollerOf(element: Element): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight)
      return node;
  }
  return null;
}
