// Reads server markup, as React renders it, into elements, so a test asks for an element by its role,
// class or id and reads its attributes and text, whatever order React writes them in.

const voidElements = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'source', 'wbr']);
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = (text) =>
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
function parseMarkup(markup) {
  const root = { tag: '', attributes: {}, children: [] };
  const open = [root];
  for (const [, closing, tag, attributeText, selfClosing, text] of markup.matchAll(
    /<!--[\s\S]*?-->|<\/([\w-]+)\s*>|<([\w-]+)((?:\s+[^\s=/>]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/g,
  )) {
    const parent = open.at(-1);
    if (text !== undefined) parent.children.push(decode(text));
    else if (closing) open.pop();
    else if (tag) {
      const attributes = Object.fromEntries(
        [...attributeText.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)].map(([, name, value]) => [
          name,
          decode(value ?? ''),
        ]),
      );
      const element = { tag, attributes, children: [] };
      parent.children.push(element);
      if (!selfClosing && !voidElements.has(tag)) open.push(element);
    }
  }
  return root.children.filter((child) => typeof child === 'object');
}

/** An element and every element inside it, in document order. */
export const elementsOf = (element) => [
  element,
  ...element.children.filter((child) => typeof child === 'object').flatMap(elementsOf),
];

/** The first element of `markup`, as parseMarkup reads it. */
export const firstElement = (markup) => parseMarkup(markup)[0];

/** The text of an element and what it holds. */
export const textOf = (element) =>
  element.children.map((child) => (typeof child === 'string' ? child : textOf(child))).join('');

/** Whether an element's class attribute lists `name`. */
export const hasClass = (element, name) =>
  (element.attributes.class ?? '').split(/\s+/).includes(name);

/**
 * The texts of the elements an element's aria-describedby names, in its order, found in `root`.
 */
export function descriptions(root, element) {
  const ids = element.attributes['aria-describedby']?.split(/\s+/) ?? [];
  return ids.map((id) => {
    const described = elementsOf(root).find((each) => each.attributes.id === id);
    return described && textOf(described).trim();
  });
}
