'use client';

import type { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useRef, useState } from 'react';
import type { ComboboxProps } from '../Combobox.js';

/** Changes of the typed text that people make, rather than the field filling in a chosen label. */
const typedChanges = new Set(['input-change', 'input-clear', 'clear-press', 'escape-key']);

/**
 * A combobox's text: what the input shows, and the query it reports as people type. Esc keeps the
 * text of a field that isn't clearable, and goes on, such as to close a dialog. Once a single field
 * shows its chosen label again, the query is over and an empty one is reported, so options found
 * for it, such as on a server, go with it.
 */
export function useComboboxQuery({
  initialText,
  clearable,
  multiple,
  onInputValueChange,
}: Pick<ComboboxProps, 'onInputValueChange'> & {
  /** The text the input starts with: the chosen option's label, or none. */
  initialText: string;
  clearable: boolean;
  multiple: boolean;
}) {
  const [inputText, setInputText] = useState(initialText);
  // The query onInputValueChange reported last.
  const reportedQuery = useRef('');

  function handleInputValueChange(next: string, details: BaseCombobox.Root.ChangeEventDetails) {
    if (details.isCanceled) return;
    if (details.reason === 'escape-key' && !clearable) {
      details.cancel();
      details.allowPropagation();
      return;
    }
    setInputText(next);
    if (typedChanges.has(details.reason)) {
      reportedQuery.current = next;
      onInputValueChange?.(next);
    } else if (!multiple && reportedQuery.current !== '') {
      reportedQuery.current = '';
      onInputValueChange?.('');
    }
  }

  return { inputText, handleInputValueChange };
}
