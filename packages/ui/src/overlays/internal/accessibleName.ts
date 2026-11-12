/** Whether an element is hidden from assistive technology, by aria-hidden, hidden or its style. */
function hiddenFromAccessibility(element: Element): boolean {
  if (element.getAttribute('aria-hidden') === 'true' || element.hasAttribute('hidden')) return true;
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  return !!style && (style.display === 'none' || style.visibility === 'hidden');
}

/**
 * The text an element contributes to a name, as assistive technology reads it: text hidden from
 * it, by aria-hidden, hidden or a display or visibility that hides it, counts for nothing, while
 * text hidden only visually counts; an image counts with its alternative text, and an element with
 * an aria-label inside with that label. The root itself is never checked for being hidden: the
 * stand-in of a disabled control hides the control it names, which must keep its name, and a
 * hidden label that aria-labelledby references directly still names. Below a hidden root, as in
 * such a label, hidden text counts too.
 */
function nameText(node: Node, root: Node, hiddenCounts = false): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof Element)) return '';
  if (node !== root && !hiddenCounts && hiddenFromAccessibility(node)) return '';
  if (node !== root) {
    const label = node.getAttribute('aria-label')?.trim();
    if (label) return ` ${label} `;
  }
  if (node.tagName === 'IMG') return node.getAttribute('alt') ?? '';
  return Array.from(node.childNodes, (child) => nameText(child, root, hiddenCounts)).join('');
}

/**
 * An element's accessible name as the page has it: its aria-labelledby text, hidden labels it
 * references directly among it, its aria-label, its visible labels, or its text, without text
 * hidden from assistive technology. Enough to tell whether a control is named, and by what words.
 */
export function accessibleName(element: Element | null | undefined): string | undefined {
  if (!element) return undefined;
  const clean = (text: string | null | undefined) => text?.replace(/\s+/g, ' ').trim() || undefined;
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
  // A labelable element has labels; any other has none.
  const labels = Array.from((element as HTMLInputElement).labels ?? []).filter(
    (each) => !hiddenFromAccessibility(each),
  );
  if (labels.length) return clean(labels.map(textOf).join(' '));
  return clean(textOf(element));
}
