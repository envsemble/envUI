import { devAttribute, layoutAttribute } from '../elements.js';
import { layoutChildrenOf } from '../measure.js';
import { paintsOf } from '../../internal/dom/paints.js';

const propertiesFrozenOnCopies = [
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
const propertiesFrozenOnEmptySpace = propertiesFrozenOnCopies.slice(
  0,
  propertiesFrozenOnCopies.indexOf('overflow-x'),
);
const attributesThatTieACopyToThePage = [
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
const elementsThatWouldLoadOrPlayAgain = new Set([
  'IFRAME',
  'VIDEO',
  'AUDIO',
  'CANVAS',
  'OBJECT',
  'EMBED',
]);

function freezeComputedValues(original: Element, copy: HTMLElement, properties: string[]) {
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
  const copysOwnInlineStyle = copy.style.cssText;
  copy.style.cssText = copysOwnInlineStyle
    ? `${copysOwnInlineStyle};${declarations.join(';')}`
    : declarations.join(';');
}

type ScrollOffsetsToRestore = [HTMLElement, number, number][];

function frozenCopyOf(original: HTMLElement, scrolled: ScrollOffsetsToRestore): HTMLElement {
  const copy = original.cloneNode(true) as HTMLElement;
  const freezeAndStrip = (from: Element, to: HTMLElement) => {
    freezeComputedValues(from, to, propertiesFrozenOnCopies);
    for (const attribute of attributesThatTieACopyToThePage) to.removeAttribute(attribute);
    if (from.scrollTop || from.scrollLeft) scrolled.push([to, from.scrollTop, from.scrollLeft]);
    const fromChildren = Array.from(from.children);
    const toChildren = Array.from(to.children);
    fromChildren.forEach((child, index) => {
      const target = toChildren[index];
      if (!(target instanceof HTMLElement || target instanceof SVGElement)) return;
      if (
        child.hasAttribute(layoutAttribute) ||
        elementsThatWouldLoadOrPlayAgain.has(child.tagName)
      ) {
        const space = document.createElement('div');
        freezeComputedValues(child, space, propertiesFrozenOnEmptySpace);
        target.replaceWith(space);
      } else if (target instanceof HTMLElement) freezeAndStrip(child, target);
      else
        for (const attribute of attributesThatTieACopyToThePage) target.removeAttribute(attribute);
    });
  };
  freezeAndStrip(original, copy);
  return copy;
}

function ownPaintBox(node: HTMLElement): HTMLElement | null {
  const style = getComputedStyle(node);
  if (!paintsOf(style).length) return null;
  const box = document.createElement('div');
  for (const property of propertiesFrozenOnCopies.slice(
    propertiesFrozenOnCopies.indexOf('background-color'),
  ))
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

function themeAttributesOf(node: HTMLElement): Record<string, string> {
  const boundary = node.closest('[data-env-theme]');
  const attributes: Record<string, string> = {};
  for (const name of ['data-env-theme', 'data-env-contrast', 'data-env-scale']) {
    const value = boundary?.closest(`[${name}]`)?.getAttribute(name);
    if (value) attributes[name] = value;
  }
  return attributes;
}

export function surfaceOf(node: HTMLElement): { element: HTMLElement; restore: () => void } {
  const box = node.getBoundingClientRect();
  const element = document.createElement('div');
  element.className = 'env-dev-surface env-theme';
  for (const [name, value] of Object.entries(themeAttributesOf(node)))
    element.setAttribute(name, value);
  element.setAttribute(devAttribute, '');
  element.inert = true;
  element.style.width = `${node.offsetWidth}px`;
  element.style.height = `${node.offsetHeight}px`;
  const scrolled: ScrollOffsetsToRestore = [];
  const paint = ownPaintBox(node);
  if (paint) element.append(paint);
  for (const child of layoutChildrenOf(node)) {
    if (child.hasAttribute(layoutAttribute)) continue;
    if (typeof child.checkVisibility === 'function' && !child.checkVisibility()) continue;
    const rect = child.getBoundingClientRect();
    const copy = elementsThatWouldLoadOrPlayAgain.has(child.tagName)
      ? document.createElement('div')
      : frozenCopyOf(child, scrolled);
    if (elementsThatWouldLoadOrPlayAgain.has(child.tagName))
      freezeComputedValues(child, copy, propertiesFrozenOnEmptySpace);
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
  const style = getComputedStyle(node);
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType !== Node.TEXT_NODE || !child.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(child);
    const rect = range.getBoundingClientRect();
    const looseTextCopy = document.createElement('span');
    looseTextCopy.textContent = child.textContent;
    for (const property of [
      'color',
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
      'white-space',
    ])
      looseTextCopy.style.setProperty(property, style.getPropertyValue(property));
    Object.assign(looseTextCopy.style, {
      position: 'absolute',
      left: `${rect.left - box.left}px`,
      top: `${rect.top - box.top}px`,
      width: `${Math.ceil(rect.width) + 1}px`,
    });
    element.append(looseTextCopy);
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
