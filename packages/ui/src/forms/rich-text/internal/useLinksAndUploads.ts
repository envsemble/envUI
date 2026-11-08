'use client';

import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { linkDialog as linkDialogMessages } from '../../../foundations/messages/linkDialog.js';
import { richText as richTextMessages } from '../../../foundations/messages/richText.js';
import type { EditorLink } from '../../internal/LinkDialog.js';
import { useMessages } from '../../../internal/EnvUIContext.js';
import type { RichTextAttachment, RichTextEditorProps } from '../types.js';
import { safeRichTextUrl } from './referenceAttributes.js';

/** Links the selected text, or inserts the link's label, or else its address, where the cursor is. */
function insertLink(editor: Editor, selection: Editor['state']['selection'], link: EditorLink) {
  if (!selection.empty) {
    editor
      .chain()
      .focus()
      .setTextSelection({ from: selection.from, to: selection.to })
      .setLink({ href: link.href })
      .run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(selection.from, {
        type: 'text',
        text: link.label || link.href,
        marks: [{ type: 'link', attrs: { href: link.href } }],
      })
      .run();
  }
}

/** An uploaded file as the document takes it: an image, or a reference to the file. */
const attachmentContent = (attachment: RichTextAttachment) =>
  attachment.kind === 'image'
    ? { type: 'image', attrs: { src: attachment.url, alt: attachment.label } }
    : {
        type: 'envReference',
        attrs: {
          id: attachment.id ?? attachment.url,
          label: attachment.label,
          href: attachment.url,
          kind: 'file',
          mentionSuggestionChar: '',
        },
      };

/**
 * Insert link and Attach files of RichTextEditor: the link from the built-in dialog or the
 * application's picker, and the uploaded files, each inserted where the selection was, unless the
 * document changed meanwhile. One runs at a time: the next, or the editor becoming disabled or
 * read-only, or a new controlled value, aborts it. status says what went wrong, or that files upload.
 */
export function useLinksAndUploads({
  editor,
  value,
  disabled,
  readOnly,
  pickLink,
  onUpload,
}: Pick<RichTextEditorProps, 'value' | 'pickLink' | 'onUpload'> & {
  editor: Editor | null;
  disabled: boolean;
  readOnly: boolean;
}) {
  const messages = useMessages('richText', richTextMessages);
  const linkMessages = useMessages('linkDialog', linkDialogMessages);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [linkRequest, setLinkRequest] = useState<{
    selectedText: string;
    insert: (link: EditorLink) => void;
  } | null>(null);
  const pending = useRef<AbortController | null>(null);
  // Where focus returns as the link dialog closes.
  const focusTarget = useRef<HTMLElement | null>(null);
  useEffect(() => {
    focusTarget.current = editor?.view.dom ?? null;
  }, [editor]);
  useEffect(() => {
    pending.current?.abort();
    setBusy(false);
    setLinkRequest(null);
    setStatus('');
    return () => pending.current?.abort();
  }, [editor, disabled, readOnly, value]);

  /** Aborts what runs, and returns the signal of what starts. */
  function start() {
    const controller = new AbortController();
    pending.current?.abort();
    pending.current = controller;
    setBusy(true);
    return controller.signal;
  }

  function requestLink() {
    if (!editor || disabled || readOnly || busy) return;
    const selection = editor.state.selection;
    const document = editor.state.doc;
    const selectedText = document.textBetween(selection.from, selection.to, ' ', (node) =>
      node.type.name === 'envReference'
        ? `${node.attrs.mentionSuggestionChar ?? ''}${node.attrs.label ?? node.attrs.id}`
        : '',
    );
    const insert = (link: EditorLink) => {
      if (editor.isDestroyed || !editor.isEditable || !editor.state.doc.eq(document)) {
        setStatus(messages.changedWhilePicking);
        return;
      }
      if (!safeRichTextUrl(link.href)) {
        setStatus(linkMessages.invalidPath);
        return;
      }
      insertLink(editor, selection, link);
    };
    setStatus('');
    if (!pickLink) {
      setLinkRequest({ selectedText, insert });
      return;
    }
    const signal = start();
    void Promise.resolve()
      .then(() => pickLink({ selectedText }))
      .then((link) => {
        if (!signal.aborted && link) insert(link);
      })
      .catch(() => {
        if (!signal.aborted) setStatus(messages.pickerFailed);
      })
      .finally(() => {
        if (!signal.aborted) setBusy(false);
      });
  }

  async function upload(files: readonly File[]) {
    if (!editor || !onUpload || !files.length || disabled || readOnly || busy) return;
    const document = editor.state.doc;
    const selection = editor.state.selection;
    const signal = start();
    setStatus(messages.uploading);
    try {
      const attachments = [];
      for (const file of files) {
        const attachment = await onUpload(file, { signal });
        if (signal.aborted) return;
        if (attachment) {
          if (!safeRichTextUrl(attachment.url)) {
            setStatus(messages.unsafeUpload);
            return;
          }
          attachments.push(attachmentContent(attachment));
        }
      }
      if (editor.isDestroyed || !editor.isEditable || !editor.state.doc.eq(document)) {
        setStatus(messages.changedWhileUploading);
        return;
      }
      if (attachments.length)
        editor
          .chain()
          .focus()
          .insertContentAt({ from: selection.from, to: selection.to }, attachments)
          .run();
      setStatus('');
    } catch (cause) {
      // The application's own message, such as a rejection's, else the provider's.
      if (!signal.aborted)
        setStatus(cause instanceof Error && cause.message ? cause.message : messages.uploadFailed);
    } finally {
      if (!signal.aborted) setBusy(false);
    }
  }

  return {
    status,
    busy,
    linkRequest,
    closeLinkRequest: () => setLinkRequest(null),
    focusTarget,
    requestLink,
    upload,
  };
}
