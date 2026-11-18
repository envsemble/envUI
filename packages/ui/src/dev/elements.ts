import type { NodeData } from './model.js';
import { partClassOf } from './parts.js';

export const layoutAttribute = 'data-env-layout';
export const devAttribute = 'data-env-dev';

export const isDevElement = (element: Element) => element.closest(`[${devAttribute}]`) !== null;

export function describeElement(element: Element): string {
  const part = partClassOf(element);
  const label = element.getAttribute('aria-label');
  return `${element.tagName.toLowerCase()}${part ? `.${part}` : ''}${label ? ` "${label}"` : ''}`;
}

export function nearestNodeOf(element: Element, indexOf: Map<Element, number>): number | null {
  for (let at = element.parentElement; at; at = at.parentElement) {
    const index = indexOf.get(at);
    if (index !== undefined) return index;
  }
  return null;
}

export function nodeLabelFor(nodes: NodeData[], index: number, element: Element): string {
  const node = nodes[index];
  if (node) return node.name === node.kind ? node.kind : `${node.kind} "${node.name}"`;
  const kind = element.getAttribute(layoutAttribute) ?? 'node';
  const name = partClassOf(element) ?? element.getAttribute('data-env-name') ?? kind;
  return name === kind ? kind : `${kind} "${name}"`;
}
