// What the 3D view draws on a node's plane: its surfaces. These are its own paint and its
// children that are not nodes, deep-copied, with the nodes inside them left as empty space of
// their size, since those get planes of their own.
//
// A copy no longer sits inside the containers and the selectors its original answers to, so
// every copied element takes the computed values of the properties that lay it out and paint it,
// frozen inline. Copies are inert, and lose what would tie them to the page: ids, names, popovers.

import { devAttribute, layoutAttribute } from '../elements.js';
import { layoutChildrenOf } from '../measure.js';
import { paintsOf } from '../../internal/dom/paints.js';

/** Properties frozen on every copied element. */
const frozen = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'translate',
  'rotate',
  'scale',
  'transform',
  'flex-direction',
  'flex-wrap',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'align-items',
  'align-self',
  'align-content',
  'justify-content',
  'justify-items',
  'justify-self',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-row-start',
  'grid-row-end',
  'grid-column-start',
  'grid-column-end',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'overflow-x',
  'overflow-y',
  'visibility',
  'opacity',
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'text-decoration-line',
  'white-space',
  'fill',
  'stroke',
  'background-color',
  'background-image',
  'background-size',
  'background-position',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'box-shadow',
  'outline-style',
  'outline-width',
  'outline-color',
  'outline-offset',
];
/** Properties frozen on the empty space a node inside a copy leaves. */
const spaceProperties = frozen.slice(0, frozen.indexOf('overflow-x'));
/** Attributes a copy must not keep: they would tie it to the page. */
const stripped = [
  'id',
  'name',
  'form',
  'for',
  'popover',
  'autofocus',
  layoutAttribute,
  'data-env-name',
  'tabindex',
];
/** Elements a copy holds as an empty box of their size: they would load or play again. */
const replaced = new Set(['IFRAME', 'VIDEO', 'AUDIO', 'CANVAS', 'OBJECT', 'EMBED']);

/**
 * Freezes an element's computed values of some properties inline on its copy, written as one
 * declaration list rather than property by property.
 */
function freeze(original: Element, copy: HTMLElement, properties: string[]) {
  const style = getComputedStyle(original);
  const declarations: string[] = [];
  for (const property of properties) {
    const value = style.getPropertyValue(property);
    if (value) declarations.push(`${property}:${value}`);
  }
  declarations.push('container-type:normal', 'transition:none', 'animation:none');
  if (style.display !== 'inline' && style.display !== 'contents' && original instanceof HTMLElement)
    declarations.push(
      'box-sizing:border-box',
      `width:${original.offsetWidth}px`,
      `height:${original.offsetHeight}px`,
    );
  // After the copy's own inline style, such as custom properties a component sets inline, which
  // the frozen values override.
  const own = copy.style.cssText;
  copy.style.cssText = own ? `${own};${declarations.join(';')}` : declarations.join(';');
}

/** Scroll offsets to set once a copy is in the document. */
type Scrolled = [HTMLElement, number, number][];

/** A deep copy of an element that is not a node, frozen, with the nodes inside it as empty space. */
function copyOf(original: HTMLElement, scrolled: Scrolled): HTMLElement {
  const copy = original.cloneNode(true) as HTMLElement;
  const sync = (from: Element, to: HTMLElement) => {
    freeze(from, to, frozen);
    for (const attribute of stripped) to.removeAttribute(attribute);
    if (from.scrollTop || from.scrollLeft) scrolled.push([to, from.scrollTop, from.scrollLeft]);
    const fromChildren = Array.from(from.children);
    const toChildren = Array.from(to.children);
    fromChildren.forEach((child, index) => {
      const target = toChildren[index];
      if (!(target instanceof HTMLElement || target instanceof SVGElement)) return;
      if (child.hasAttribute(layoutAttribute) || replaced.has(child.tagName)) {
        const space = document.createElement('div');
        freeze(child, space, spaceProperties);
        target.replaceWith(space);
      } else if (target instanceof HTMLElement) sync(child, target);
      else for (const attribute of stripped) target.removeAttribute(attribute);
    });
  };
  sync(original, copy);
  return copy;
}

/** The node's own paint as a box of its size, or null when it paints nothing. */
function ownPaint(node: HTMLElement): HTMLElement | null {
  const style = getComputedStyle(node);
  if (!paintsOf(style).length) return null;
  const box = document.createElement('div');
  for (const property of frozen.slice(frozen.indexOf('background-color')))
    box.style.setProperty(property, style.getPropertyValue(property));
  Object.assign(box.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: `${node.offsetWidth}px`,
    height: `${node.offsetHeight}px`,
    boxSizing: 'border-box',
  });
  return box;
}

/** The theme a copy needs for the tokens its frozen values don't cover: the node's boundary's. */
function themeOf(node: HTMLElement): Record<string, string> {
  const boundary = node.closest('[data-env-theme]');
  const attributes: Record<string, string> = {};
  for (const name of ['data-env-theme', 'data-env-contrast', 'data-env-scale']) {
    const value = boundary?.closest(`[${name}]`)?.getAttribute(name);
    if (value) attributes[name] = value;
  }
  return attributes;
}

/**
 * The surfaces of a node: a box of its size holding its own paint and copies of its children that
 * are not nodes, each where it is in the node. `restore` scrolls the copied scrollers once the box
 * is in the document.
 */
export function surfaceOf(node: HTMLElement): { element: HTMLElement; restore: () => void } {
  const box = node.getBoundingClientRect();
  const element = document.createElement('div');
  element.className = 'env-dev-surface env-theme';
  for (const [name, value] of Object.entries(themeOf(node))) element.setAttribute(name, value);
  element.setAttribute(devAttribute, '');
  element.inert = true;
  element.style.width = `${node.offsetWidth}px`;
  element.style.height = `${node.offsetHeight}px`;
  const scrolled: Scrolled = [];
  const paint = ownPaint(node);
  if (paint) element.append(paint);
  for (const child of layoutChildrenOf(node)) {
    if (child.hasAttribute(layoutAttribute)) continue;
    if (typeof child.checkVisibility === 'function' && !child.checkVisibility()) continue;
    const rect = child.getBoundingClientRect();
    const copy = replaced.has(child.tagName)
      ? document.createElement('div')
      : copyOf(child, scrolled);
    if (replaced.has(child.tagName)) freeze(child, copy, spaceProperties);
    const display = getComputedStyle(child).display;
    Object.assign(copy.style, {
      position: 'absolute',
      left: `${rect.left - box.left}px`,
      top: `${rect.top - box.top}px`,
      right: 'auto',
      bottom: 'auto',
      translate: 'none',
      transform: 'none',
      margin: '0',
      display: display === 'inline' ? 'inline-block' : display,
    });
    element.append(copy);
  }
  // Text directly in the node, outside any element, drawn where it is with the node's type.
  const style = getComputedStyle(node);
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType !== Node.TEXT_NODE || !child.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(child);
    const rect = range.getBoundingClientRect();
    const text = document.createElement('span');
    text.textContent = child.textContent;
    for (const property of [
      'color',
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
      'white-space',
    ])
      text.style.setProperty(property, style.getPropertyValue(property));
    Object.assign(text.style, {
      position: 'absolute',
      left: `${rect.left - box.left}px`,
      top: `${rect.top - box.top}px`,
      width: `${Math.ceil(rect.width) + 1}px`,
    });
    element.append(text);
  }
  return {
    element,
    restore() {
      for (const [target, top, left] of scrolled) {
        target.style.overflow = 'hidden';
        target.scrollTop = top;
        target.scrollLeft = left;
      }
    },
  };
}
