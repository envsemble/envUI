'use client';

import { isValidElement, useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';

const collapsed = (text: string) => text.replace(/\s+/g, ' ').trim();

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
 * A label's text: its textValue, else the label when it is a string, else the label's rendered
 * text, read from the element that shows it, or from its content where it isn't rendered.
 */
export function labelText(
  label: ReactNode,
  textValue: string | undefined,
  rendered?: Element | null,
): string {
  if (textValue !== undefined) return textValue;
  if (typeof label === 'string' || typeof label === 'number') return String(label);
  const shown = rendered?.textContent;
  return collapsed(shown ?? contentText(label));
}

/**
 * labelText of a label that the element renders, following the rendered text as it changes. Before
 * the element is there, as on the server, it is the text the content holds.
 */
export function useLabelText(
  label: ReactNode,
  textValue: string | undefined,
  element: RefObject<HTMLElement | null>,
): string {
  const readsRenderedText = textValue === undefined && typeof label !== 'string';
  const [shown, setShown] = useState<string | undefined>(undefined);
  useLayoutEffect(
    function followTheRenderedTextOfALabelThatIsNotText() {
      const node = element.current;
      if (!readsRenderedText || !node) return;
      const read = () => setShown(collapsed(node.textContent ?? ''));
      read();
      const observer = new MutationObserver(read);
      observer.observe(node, { childList: true, characterData: true, subtree: true });
      return () => observer.disconnect();
    },
    [readsRenderedText, element],
  );
  return readsRenderedText && shown !== undefined ? shown : labelText(label, textValue);
}
