// How dev mode tells the page's elements apart and names them: the attributes it reads, its own
// UI, which it leaves out, and the labels the readout prints for what it finds.

import type { NodeData } from './model.js';
import { partClassOf } from './parts.js';

/** The attribute every primitive and scaffold renders on its root, with its kind. */
export const layoutAttribute = 'data-env-layout';
/** The attribute on dev mode's own UI, which the readout leaves out. */
export const devAttribute = 'data-env-dev';

/** Whether an element belongs to dev mode's own UI. */
export const isDevElement = (element: Element) => element.closest(`[${devAttribute}]`) !== null;

/** A short description of an element that is not a node: its tag and part class, or its label. */
export function describeElement(element: Element): string {
  const part = partClassOf(element);
  const label = element.getAttribute('aria-label');
  return `${element.tagName.toLowerCase()}${part ? `.${part}` : ''}${label ? ` "${label}"` : ''}`;
}

/** The node an element is in: its nearest ancestor that is a node. */
export function nearestNodeOf(element: Element, indexOf: Map<Element, number>): number | null {
  for (let at = element.parentElement; at; at = at.parentElement) {
    const index = indexOf.get(at);
    if (index !== undefined) return index;
  }
  return null;
}

/** A node's label for its parent's children, before the readout formats it. */
export function labelFor(nodes: NodeData[], index: number, element: Element): string {
  const node = nodes[index];
  if (node) return node.name === node.kind ? node.kind : `${node.kind} "${node.name}"`;
  const kind = element.getAttribute(layoutAttribute) ?? 'node';
  const name = partClassOf(element) ?? element.getAttribute('data-env-name') ?? kind;
  return name === kind ? kind : `${kind} "${name}"`;
}
