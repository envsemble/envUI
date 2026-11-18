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

function parseMarkup(markup: string) {
  const root: MarkupElement = { tag: '', attributes: {}, children: [] };
  const open = [root];
  for (const [, closing, tag, attributeText, selfClosing, text] of markup.matchAll(
    /<!--[\s\S]*?-->|<\/([\w-]+)\s*>|<([\w-]+)((?:\s+[^\s=/>]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/g,
  )) {
    const parent = open.at(-1)!;
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

export const elementsOf = (element: MarkupElement): MarkupElement[] => [
  element,
  ...element.children.filter(isElement).flatMap(elementsOf),
];

export function findElement(root: MarkupElement, matches: (element: MarkupElement) => boolean) {
  const found = elementsOf(root).find(matches);
  if (!found) throw new Error(`No element in <${root.tag}> matches ${matches}.`);
  return found;
}

export function firstElement(markup: string) {
  const [first] = parseMarkup(markup);
  if (!first) throw new Error(`No element in ${JSON.stringify(markup)}.`);
  return first;
}

export const textOf = (element: MarkupElement): string =>
  element.children.map((child) => (typeof child === 'string' ? child : textOf(child))).join('');

export const hasClass = (element: MarkupElement, name: string) =>
  (element.attributes.class ?? '').split(/\s+/).includes(name);

export function descriptions(root: MarkupElement, element: MarkupElement) {
  const ids = element.attributes['aria-describedby']?.split(/\s+/) ?? [];
  return ids.map((id) => {
    const described = elementsOf(root).find((each) => each.attributes.id === id);
    return described && textOf(described).trim();
  });
}
