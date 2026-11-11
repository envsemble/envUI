// Reads server markup, as React renders it, into elements, so a test asks for an element by its role,
// class or id and reads its attributes and text, whatever order React writes them in.

/** An element of server markup: its tag, its attributes by name, and the elements and text in it. */
export interface MarkupElement {
  tag: string;
  attributes: Record<string, string>;
  children: (MarkupElement | string)[];
}

const voidElements = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'source', 'wbr']);
const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = (text: string) =>
  text.replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (entity, decimal, hex, name) =>
    decimal
      ? String.fromCodePoint(Number(decimal))
      : hex
        ? String.fromCodePoint(Number.parseInt(hex, 16))
        : (entities[name] ?? entity),
  );

/**
 * The elements of `markup` at its top level, each `{ tag, attributes, children }`, its children
 * elements and text. Comments, such as React's between two runs of text, are left out.
 */
function parseMarkup(markup: string) {
  const root: MarkupElement = { tag: '', attributes: {}, children: [] };
  const open = [root];
  for (const [, closing, tag, attributeText, selfClosing, text] of markup.matchAll(
    /<!--[\s\S]*?-->|<\/([\w-]+)\s*>|<([\w-]+)((?:\s+[^\s=/>]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/g,
  )) {
    const parent = open.at(-1)!; // The root is never closed.
    if (text !== undefined) parent.children.push(decode(text));
    else if (closing) open.pop();
    else if (tag) {
      const attributes = Object.fromEntries(
        [...attributeText.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)].map(([, name, value]) => [
          name,
          decode(value ?? ''),
        ]),
      );
      const element: MarkupElement = { tag, attributes, children: [] };
      parent.children.push(element);
      if (!selfClosing && !voidElements.has(tag)) open.push(element);
    }
  }
  return root.children.filter(isElement);
}

function isElement(child: MarkupElement | string): child is MarkupElement {
  return typeof child === 'object';
}

/** An element and every element inside it, in document order. */
export const elementsOf = (element: MarkupElement): MarkupElement[] => [
  element,
  ...element.children.filter(isElement).flatMap(elementsOf),
];

/** The first element of `markup`, as parseMarkup reads it; markup without one is a mistake. */
export function firstElement(markup: string) {
  const [first] = parseMarkup(markup);
  if (!first) throw new Error(`No element in ${JSON.stringify(markup)}.`);
  return first;
}

/** The text of an element and what it holds. */
export const textOf = (element: MarkupElement): string =>
  element.children.map((child) => (typeof child === 'string' ? child : textOf(child))).join('');

/** Whether an element's class attribute lists `name`. */
export const hasClass = (element: MarkupElement, name: string) =>
  (element.attributes.class ?? '').split(/\s+/).includes(name);

/**
 * The texts of the elements an element's aria-describedby names, in its order, found in `root`.
 */
export function descriptions(root: MarkupElement, element: MarkupElement) {
  const ids = element.attributes['aria-describedby']?.split(/\s+/) ?? [];
  return ids.map((id) => {
    const described = elementsOf(root).find((each) => each.attributes.id === id);
    return described && textOf(described).trim();
  });
}
