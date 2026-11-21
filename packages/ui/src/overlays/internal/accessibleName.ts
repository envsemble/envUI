import { collapseWhitespace } from '../../internal/text/labelText.js';
function hiddenFromAccessibility(element: Element): boolean {
  if (element.getAttribute('aria-hidden') === 'true' || element.hasAttribute('hidden')) return true;
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  return !!style && (style.display === 'none' || style.visibility === 'hidden');
}

function nameText(node: Node, root: Node, belowHiddenRoot = false): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof Element)) return '';
  const isRoot = node === root;
  if (!isRoot && !belowHiddenRoot && hiddenFromAccessibility(node)) return '';
  if (!isRoot) {
    const label = node.getAttribute('aria-label')?.trim();
    if (label) return ` ${label} `;
  }
  if (node.tagName === 'IMG') return node.getAttribute('alt') ?? '';
  return Array.from(node.childNodes, (child) => nameText(child, root, belowHiddenRoot)).join('');
}

/**
 * An element's accessible name as the page has it: its aria-labelledby text, hidden labels it
 * references directly among it, its aria-label, its visible labels, or its text, without text
 * hidden from assistive technology. Enough to tell whether a control is named, and by what words.
 */
export function accessibleName(element: Element | null | undefined): string | undefined {
  if (!element) return undefined;
  const clean = (text: string | null | undefined) => collapseWhitespace(text ?? '') || undefined;
  const textOf = (node: Node) => nameText(node, node);
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = clean(
      labelledBy
        .split(/\s+/)
        .map((id) => {
          const label = element.ownerDocument.getElementById(id);
          if (!label) return '';
          if (label === element) return label.getAttribute('aria-label') ?? textOf(label);
          return nameText(label, label, hiddenFromAccessibility(label));
        })
        .join(' '),
    );
    if (text) return text;
  }
  const label = clean(element.getAttribute('aria-label'));
  if (label) return label;
  const labels = Array.from((element as HTMLInputElement).labels ?? []).filter(
    (each) => !hiddenFromAccessibility(each),
  );
  if (labels.length) return clean(labels.map(textOf).join(' '));
  return clean(textOf(element));
}
