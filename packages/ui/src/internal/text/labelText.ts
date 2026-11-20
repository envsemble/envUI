import { isValidElement, type ReactNode } from 'react';

/** Text with each run of whitespace made one space and none at its ends, as a name reads it. */
export const collapseWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * The text content holds before it renders: its strings and numbers, through the children of its
 * elements. A component that renders text of its own adds none.
 */
function contentText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint')
    return String(node);
  if (Array.isArray(node)) return node.map(contentText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return contentText(node.props.children);
  return '';
}

/**
 * A label's text where it is given as text: its textValue, else the label when it is a string or a
 * number. Undefined for a label that only its rendered text names.
 */
export function givenLabelText(label: ReactNode, textValue: string | undefined) {
  if (textValue !== undefined) return textValue;
  if (typeof label === 'string' || typeof label === 'number') return String(label);
  return undefined;
}

/**
 * A label's text: its textValue, else the label when it is a string, else the label's rendered
 * text, read from the element that shows it, or from its content where it isn't rendered.
 */
export function labelText(
  label: ReactNode,
  textValue: string | undefined,
  rendered?: Element | null,
): string {
  const given = givenLabelText(label, textValue);
  if (given !== undefined) return given;
  const shown = rendered?.textContent;
  return collapseWhitespace(shown ?? contentText(label));
}

/** Calls onText with the text the element renders, now and as it changes; returns what stops it. */
export function followRenderedText(element: Element, onText: (text: string) => void) {
  const read = () => onText(collapseWhitespace(element.textContent ?? ''));
  read();
  const observer = new MutationObserver(read);
  observer.observe(element, { childList: true, characterData: true, subtree: true });
  return () => observer.disconnect();
}
