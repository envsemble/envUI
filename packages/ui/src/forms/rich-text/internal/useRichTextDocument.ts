'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { AnyExtension } from '@tiptap/core';
import type { PluginKey } from '@tiptap/pm/state';
import { useEditor, type Editor } from '@tiptap/react';
import { exitSuggestion } from '@tiptap/suggestion';
import type { RichTextEditorProps } from '../types.js';
import '../../../styles/Base.css';
import '../../../styles/Prose.css';
import '../../../styles/RichText.css';

export interface RichTextDocumentLatest extends Pick<
  RichTextEditorProps,
  'onValueChange' | 'onLinkClick'
> {
  disabled: boolean;
  readOnly: boolean;
}

export const documentAttributes = {
  role: 'textbox',
  'aria-multiline': 'true',
  class: 'env-prose env-rich-text-document',
};

const baseStylesComeFromRichTextCssInEnvuiLayer = true;

const afterReactCommitsAsNodeViewsRenderAtOnce = (task: () => void) => queueMicrotask(task);

function documentAlreadyShows(editor: Editor, value: string) {
  if (value === editor.getMarkdown()) return true;
  return Boolean(
    editor.markdown &&
    editor.schema.nodeFromJSON(editor.markdown.parse(value)).eq(editor.state.doc),
  );
}

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
      injectCSS: !baseStylesComeFromRichTextCssInEnvuiLayer,
      editable: !disabled && !readOnly,
      editorProps: {
        attributes: documentAttributes,
        handleClick: (_view, _position, event) => {
          const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
          if (anchor && !anchor.closest('[data-reference-id]')) {
            if (!latest.current.readOnly || latest.current.disabled) event.preventDefault();
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
      onBlur: ({ editor: current }) => {
        for (const key of suggestionKeys) exitSuggestion(current.view, key);
      },
    },
    [extensions, suggestionKeys],
  );
  useEffect(function resyncDocumentWithControlledValue() {
    if (!editor || value === undefined) return;
    let cancelled = false;
    afterReactCommitsAsNodeViewsRenderAtOnce(() => {
      if (cancelled || editor.isDestroyed || documentAlreadyShows(editor, value)) return;
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
