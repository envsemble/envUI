import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { remPixels } from '../../shared/Lengths';

const stages = '.catalogue-tile-stage, .catalogue-motion-stage';

const arrow = 'M1 1 V16.5 L5 12.8 L7.8 19 L10.4 17.9 L7.7 11.8 H13 Z';

const chipOffsetRem = 0.875;
const stageEdgeMarginPx = 4;

const svgNamespace = 'http://www.w3.org/2000/svg';

interface Geometry {
  stage: HTMLElement;
  box: DOMRect;
  stageScale: number;
  scale: number;
  clientLeft: number;
  clientTop: number;
}

function geometryOf(stage: HTMLElement, scope: HTMLElement): Geometry {
  const box = stage.getBoundingClientRect();
  const stageScale = box.width / (stage.offsetWidth || box.width) || 1;
  const own = scope.getBoundingClientRect();
  const scale = (own.width / (scope.offsetWidth || own.width) || 1) / stageScale;
  return {
    stage,
    box,
    stageScale,
    scale,
    clientLeft: stage.clientLeft,
    clientTop: stage.clientTop,
  };
}

export class PointerCursor {
  private element: HTMLElement | null = null;
  private noted: Geometry | null = null;
  private layer: HTMLElement | null = null;
  private chip: { element: HTMLElement; name: HTMLElement; icon: Root } | null = null;

  constructor(private readonly scope: Element) {}

  note() {
    const stage = this.scope.closest<HTMLElement>(stages);
    if (!stage) return;
    this.noted = geometryOf(stage, this.scope as HTMLElement);
    queueMicrotask(() => (this.noted = null));
  }

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
    const { box, stageScale, scale, clientLeft, clientTop } =
      this.noted?.stage === stage ? this.noted : geometryOf(stage, this.scope as HTMLElement);
    const x = (point.x - box.left) / stageScale - clientLeft;
    const y = (point.y - box.top) / stageScale - clientTop;
    element.style.translate = `${x}px ${y}px`;
    element.style.setProperty('--catalogue-cursor-scale', String(scale));
    element.toggleAttribute('data-pressed', pressed);
    this.carry(element, files);
    this.placeChip(x, y, scale, stage);
  }

  private placeChip(x: number, y: number, scale: number, stage: HTMLElement) {
    const chip = this.chip?.element;
    if (!chip?.isConnected) return;
    const rem = remPixels();
    const rtl = getComputedStyle(stage).direction === 'rtl';
    const fromStart = rtl ? stage.clientWidth - x : x;
    const end = fromStart + (chipOffsetRem * rem + chip.offsetWidth) * scale;
    const foot = y + (rem + chip.offsetHeight) * scale;
    chip.toggleAttribute('data-before', end > stage.clientWidth - stageEdgeMarginPx);
    chip.toggleAttribute('data-above', foot > stage.clientHeight - stageEdgeMarginPx);
  }

  private carry(cursor: HTMLElement, files: readonly string[]) {
    if (!files.length) {
      this.chip?.element.remove();
      return;
    }
    const chip = this.chip ?? this.makeChip();
    if (chip.element.parentElement !== cursor) cursor.append(chip.element);
    const text = files.length > 1 ? `${files[0]} +${files.length - 1}` : files[0];
    if (chip.name.textContent !== text) chip.name.textContent = text;
  }

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
