'use client';

import type { ReactNode, RefObject } from 'react';
import { givenLabelText, labelText } from '../../internal/text/labelText.js';
import { useRenderedText } from '../../internal/text/useRenderedText.js';

/**
 * labelText of a label that the element renders, following the rendered text as it changes. Before
 * the element is there, as on the server, it is the text the content holds.
 */
export function useLabelText(
  label: ReactNode,
  textValue: string | undefined,
  element: RefObject<HTMLElement | null>,
): string {
  const readsRenderedText = givenLabelText(label, textValue) === undefined;
  return useRenderedText(element, readsRenderedText) ?? labelText(label, textValue);
}
