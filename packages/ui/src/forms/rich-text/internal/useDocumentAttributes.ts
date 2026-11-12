'use client';

import { useLayoutEffect, type AriaAttributes, type ReactNode } from 'react';
import type { PluginKey } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';
import { exitSuggestion } from '@tiptap/suggestion';
import { documentAttributes } from './useRichTextDocument.js';

/**
 * Names, describes and states the editor's document as the field's control, and makes it editable
 * or not; its suggestion lists close as it becomes disabled or read-only.
 */
export function useDocumentAttributes(
  editor: Editor | null,
  {
    suggestionKeys,
    id,
    label,
    ariaLabel,
    describedBy,
    invalid,
    disabled,
    readOnly,
  }: {
    suggestionKeys: readonly PluginKey[];
    id: string;
    label: ReactNode;
    ariaLabel: string | undefined;
    describedBy: string | undefined;
    invalid: AriaAttributes['aria-invalid'];
    disabled: boolean;
    readOnly: boolean;
  },
) {
  useLayoutEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        attributes: {
          ...documentAttributes,
          id,
          'aria-label': ariaLabel ?? (typeof label === 'string' ? label : ''),
          'aria-labelledby':
            label != null && typeof label !== 'string' && !ariaLabel ? `${id}-label` : '',
          'aria-describedby': describedBy ?? '',
          'aria-invalid': String(invalid ?? false),
          'aria-disabled': String(disabled),
          'aria-readonly': String(readOnly),
        },
      },
    });
    editor.setEditable(!disabled && !readOnly, false);
    if (disabled || readOnly) {
      for (const key of suggestionKeys) exitSuggestion(editor.view, key);
    }
  }, [editor, suggestionKeys, disabled, readOnly, label, ariaLabel, id, describedBy, invalid]);
}
