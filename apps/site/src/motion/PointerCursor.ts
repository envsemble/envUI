/*
 * The cursor of the pointer no one sees (VirtualPointer.ts): a small plain arrow drawn over the
 * stage of the preview it plays in, where the pointer is, while it plays, so a reader can follow
 * what it moves to and presses. It is drawn beside the preview, not in it, so it changes nothing of
 * the component, isn't measured by a tile's fit and is never under the pointer itself; it takes the
 * scale the preview is drawn at, so it sits on what it points at, and shrinks a little while it
 * presses (Stage.css). Without motion, previews don't play, and it isn't drawn.
 */

/** The stages a cursor is drawn in: a gallery's or a Related tile's, and a page's figure's. */
const stages = '.catalogue-related-stage, .catalogue-motion-stage';

/** An arrow, its tip at the top left, in a box of 14 by 20. */
const arrow = 'M1 1 V16.5 L5 12.8 L7.8 19 L10.4 17.9 L7.7 11.8 H13 Z';

const svgNamespace = 'http://www.w3.org/2000/svg';

export class PointerCursor {
  private element: HTMLElement | null = null;

  constructor(private readonly scope: Element) {}

  /**
   * Draws the cursor at a point, in the viewport's coordinates, pressed or not; with no point, or
   * outside a stage, takes it away.
   */
  place(point: { x: number; y: number } | null, pressed: boolean) {
    const stage = this.scope.closest<HTMLElement>(stages);
    if (!point || !stage) {
      this.remove();
      return;
    }
    const element = this.element ?? this.make();
    if (element.parentElement !== stage) stage.append(element);
    const box = stage.getBoundingClientRect();
    // The scale the stage is drawn at, as a page drawn smaller would be, and the preview in it.
    const stageScale = box.width / (stage.offsetWidth || box.width) || 1;
    const own = this.scope.getBoundingClientRect();
    const scope = this.scope as HTMLElement;
    const scale = (own.width / (scope.offsetWidth || own.width) || 1) / stageScale;
    const x = (point.x - box.left) / stageScale - stage.clientLeft;
    const y = (point.y - box.top) / stageScale - stage.clientTop;
    element.style.translate = `${x}px ${y}px`;
    element.style.setProperty('--catalogue-cursor-scale', String(scale));
    element.toggleAttribute('data-pressed', pressed);
  }

  /** Takes the cursor away. */
  remove() {
    this.element?.remove();
  }

  private make() {
    const element = document.createElement('span');
    element.className = 'catalogue-pointer-cursor';
    element.setAttribute('aria-hidden', 'true');
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('viewBox', '0 0 14 20');
    const path = document.createElementNS(svgNamespace, 'path');
    path.setAttribute('d', arrow);
    svg.append(path);
    element.append(svg);
    this.element = element;
    return element;
  }
}
