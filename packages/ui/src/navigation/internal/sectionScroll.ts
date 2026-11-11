import type { ScrollView, SectionPosition } from './contentsOutline.js';

/** The element whose scrolling moves a section, or null for the document. */
function scrollerOf(element: Element): HTMLElement | null {
  const document = element.ownerDocument;
  for (
    let node = element.parentElement;
    node && node !== document.body && node !== document.documentElement;
    node = node.parentElement
  ) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return null;
}

/**
 * Where the sections are, and how far the area that scrolls them has scrolled: in layout pixels of
 * that area, as its scroll position, height and padding are, so a transform or zoom around it
 * scales the drawing and changes nothing. Each section's top counts its scroll margin and the
 * area's scroll padding.
 */
export function readSections(
  elements: readonly HTMLElement[],
  doc: Document,
): { sections: SectionPosition[]; view: ScrollView } {
  const scroller = scrollerOf(elements[0]!);
  const scrolling = scroller ?? doc.scrollingElement ?? doc.documentElement;
  const padding =
    parseFloat(getComputedStyle(scroller ?? doc.documentElement).scrollPaddingTop) || 0;
  const box = scroller?.getBoundingClientRect();
  const scale =
    scroller && box && scroller.offsetHeight > 0 ? box.height / scroller.offsetHeight || 1 : 1;
  const top = scroller && box ? box.top + scroller.clientTop * scale : 0;
  const height = scroller ? scroller.clientHeight : (doc.defaultView?.innerHeight ?? 0);
  return {
    sections: elements.map((element) => ({
      id: element.id,
      top:
        (element.getBoundingClientRect().top - top) / scale -
        padding -
        (parseFloat(getComputedStyle(element).scrollMarginTop) || 0),
    })),
    view: {
      height: Math.max(0, height - padding),
      scrolled: scrolling.scrollTop,
      range: scrolling.scrollHeight - scrolling.clientHeight,
    },
  };
}

/** Moves focus to a section, which takes it from script alone when it takes none otherwise. */
export function focusSection(element: HTMLElement) {
  if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) element.tabIndex = -1;
  element.focus({ preventScroll: true });
}
