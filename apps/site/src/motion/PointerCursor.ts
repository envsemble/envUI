/*
 * The cursor of the pointer no one sees (VirtualPointer.ts): a small plain arrow drawn over the
 * stage it plays in, where the pointer is, while it plays, so a reader can follow what it moves to
 * and presses. It is drawn beside the live component, not in it, so it changes nothing of the
 * component, isn't measured by a tile's fit and is never under the pointer itself; it takes the
 * scale the component is drawn at, so it sits on what it points at, and shrinks a little while it
 * presses (Stage.css). While it carries files in, as from the desktop, a small chip beside it names
 * them, with a file icon, as a drag image does, on whichever side of it the stage has room for it.
 * Both are drawn in a layer as large as the stage that clips them, so neither is ever drawn past the
 * stage's edges, such as over the name under it. Without motion, stages don't play, and it isn't
 * drawn.
 */
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { remPixels } from '@envui-internal/internal/lengths';

/** The stages a cursor is drawn in: a gallery's or a Related tile's, and a page's figure's. */
const stages = '.catalogue-tile-stage, .catalogue-motion-stage';

/** An arrow, its tip at the top left, in a box of 14 by 20. */
const arrow = 'M1 1 V16.5 L5 12.8 L7.8 19 L10.4 17.9 L7.7 11.8 H13 Z';

const svgNamespace = 'http://www.w3.org/2000/svg';

export class PointerCursor {
  private element: HTMLElement | null = null;
  /** The layer over the stage that clips it to the stage's edges. */
  private layer: HTMLElement | null = null;
  /** The chip that names the files it carries, and where its icon renders. */
  private chip: { element: HTMLElement; name: HTMLElement; icon: Root } | null = null;

  constructor(private readonly scope: Element) {}

  /**
   * Draws the cursor at a point, in the viewport's coordinates, pressed or not, and the names of the
   * files it carries beside it; with no point, or outside a stage, takes it away.
   */
  place(point: { x: number; y: number } | null, pressed: boolean, files: readonly string[] = []) {
    const stage = this.scope.closest<HTMLElement>(stages);
    if (!point || !stage) {
      this.remove();
      return;
    }
    const element = this.element ?? this.make();
    const layer = (this.layer ??= Object.assign(document.createElement('span'), {
      className: 'catalogue-pointer-layer',
    }));
    if (layer.parentElement !== stage) stage.append(layer);
    if (element.parentElement !== layer) layer.append(element);
    const box = stage.getBoundingClientRect();
    // The scale the stage is drawn at, as a page drawn smaller would be, and the component in it.
    const stageScale = box.width / (stage.offsetWidth || box.width) || 1;
    const own = this.scope.getBoundingClientRect();
    const scope = this.scope as HTMLElement;
    const scale = (own.width / (scope.offsetWidth || own.width) || 1) / stageScale;
    const x = (point.x - box.left) / stageScale - stage.clientLeft;
    const y = (point.y - box.top) / stageScale - stage.clientTop;
    element.style.translate = `${x}px ${y}px`;
    element.style.setProperty('--catalogue-cursor-scale', String(scale));
    element.toggleAttribute('data-pressed', pressed);
    this.carry(element, files);
    this.room(x, y, scale, stage);
  }

  /**
   * Puts the chip where the stage has room for it: after the arrow's tip, or before it near the
   * stage's end, and below it, or above it near the stage's foot.
   */
  private room(x: number, y: number, scale: number, stage: HTMLElement) {
    const chip = this.chip?.element;
    if (!chip?.isConnected) return;
    const rem = remPixels();
    const rtl = getComputedStyle(stage).direction === 'rtl';
    const fromStart = rtl ? stage.clientWidth - x : x;
    const end = fromStart + (0.875 * rem + chip.offsetWidth) * scale;
    const foot = y + (rem + chip.offsetHeight) * scale;
    chip.toggleAttribute('data-before', end > stage.clientWidth - 4);
    chip.toggleAttribute('data-above', foot > stage.clientHeight - 4);
  }

  /** Shows the chip naming the files it carries, the first and how many more, or takes it away. */
  private carry(cursor: HTMLElement, files: readonly string[]) {
    if (!files.length) {
      this.chip?.element.remove();
      return;
    }
    const chip = this.chip ?? this.makeChip();
    if (chip.element.parentElement !== cursor) cursor.append(chip.element);
    const text = files.length > 1 ? `${files[0]} +${files.length - 1}` : files[0]!;
    if (chip.name.textContent !== text) chip.name.textContent = text;
  }

  /** Takes the cursor away. */
  remove() {
    this.element?.remove();
    this.chip?.element.remove();
    this.layer?.remove();
  }

  private makeChip() {
    const element = document.createElement('span');
    element.className = 'catalogue-pointer-file';
    const icon = document.createElement('span');
    icon.className = 'catalogue-pointer-file-icon';
    const name = document.createElement('span');
    name.className = 'catalogue-pointer-file-name';
    element.append(icon, name);
    const root = createRoot(icon);
    root.render(createElement(IconDescription));
    this.chip = { element, name, icon: root };
    return this.chip;
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
