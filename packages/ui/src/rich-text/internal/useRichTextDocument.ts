'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { AnyExtension } from '@tiptap/core';
import type { PluginKey } from '@tiptap/pm/state';
import { useEditor } from '@tiptap/react';
import { exitSuggestion } from '@tiptap/suggestion';
import type { RichTextEditorProps } from '../types.js';
import '../../styles/Base.css';
// Rich text's rules refine the prose typography, so Prose.css comes first.
import '../../styles/Prose.css';
import '../../styles/RichText.css';

/** What the document reads as it runs, from the editor's latest render. */
export interface RichTextDocumentLatest extends Pick<
  RichTextEditorProps,
  'onValueChange' | 'onLinkClick'
> {
  disabled: boolean;
  readOnly: boolean;
}

/** The document's role and classes, which it keeps as useDocumentAttributes names it. */
export const documentAttributes = {
  role: 'textbox',
  'aria-multiline': 'true',
  class: 'env-prose env-rich-text-document',
};

/**
 * RichTextEditor's Tiptap editor and its value as Markdown, which follows a controlled value and
 * returns to defaultValue as the editor's form resets.
 */
export function useRichTextDocument(
  {
    extensions,
    suggestionKeys,
    value,
    defaultValue,
    disabled,
    readOnly,
    form,
  }: {
    extensions: AnyExtension[];
    suggestionKeys: readonly PluginKey[];
    value: string | undefined;
    defaultValue: string;
    disabled: boolean;
    readOnly: boolean;
    form: string | undefined;
  },
  latest: RefObject<RichTextDocumentLatest>,
) {
  const [markdown, setMarkdown] = useState(value ?? defaultValue);
  const storedMarkdown = useRef(value ?? defaultValue);
  const [, rerender] = useState(0);
  const editor = useEditor(
    {
      extensions,
      content: value ?? storedMarkdown.current,
      contentType: 'markdown',
      immediatelyRender: false,
      // ProseMirror's base styles come from RichText.css, in envUI's cascade layer, rather than from
      // a style element Tiptap adds outside any layer, where they would win over the document's.
      injectCSS: false,
      editable: !disabled && !readOnly,
      editorProps: {
        attributes: documentAttributes,
        handleClick: (_view, _position, event) => {
          // A click in the document has an element as its target.
          const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
          if (anchor && !anchor.closest('[data-reference-id]')) {
            if (!latest.current.readOnly || latest.current.disabled) event.preventDefault();
            // Tiptap's Link extension validates input; applications own navigation.
            latest.current.onLinkClick?.(anchor.getAttribute('href') ?? '', event);
            return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor: current }) => {
        const next = current.getMarkdown();
        storedMarkdown.current = next;
        setMarkdown(next);
        latest.current.onValueChange?.(next);
        rerender((count) => count + 1);
      },
      // Suggestions close as focus leaves the document, also with Tab.
      onBlur: ({ editor: current }) => {
        for (const key of suggestionKeys) exitSuggestion(current.view, key);
      },
    },
    [extensions, suggestionKeys],
  );
  // Runs after every render: the document can drift from a controlled value that stays the same,
  // as when the application declines an edit. Setting the same Markdown again renders nothing.
  // Setting content renders the node views of references and tasks at once, which React refuses
  // while it commits, also in the effects of an update from an event, so it waits for a microtask.
  useEffect(() => {
    if (!editor || value === undefined) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || editor.isDestroyed || value === editor.getMarkdown()) return;
      if (
        editor.markdown &&
        editor.schema.nodeFromJSON(editor.markdown.parse(value)).eq(editor.state.doc)
      )
        return;
      const selection = editor.state.selection;
      editor
        .chain()
        .setContent(value, { contentType: 'markdown', emitUpdate: false })
        .setMeta('addToHistory', false)
        .run();
      const size = editor.state.doc.content.size;
      editor.commands.setTextSelection({
        from: Math.min(selection.from, size),
        to: Math.min(selection.to, size),
      });
      setMarkdown(value);
      storedMarkdown.current = value;
    });
    return () => {
      cancelled = true;
    };
  });
  useEffect(() => {
    if (!editor) return;
    const ownerForm = form ? document.getElementById(form) : editor.view.dom.closest('form');
    function reset() {
      if (!editor || value !== undefined) return;
      editor.commands.setContent(defaultValue, { contentType: 'markdown' });
    }
    ownerForm?.addEventListener('reset', reset);
    return () => ownerForm?.removeEventListener('reset', reset);
  }, [editor, form, value, defaultValue]);
  return { editor, markdown };
}
