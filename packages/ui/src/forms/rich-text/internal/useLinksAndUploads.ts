'use client';

import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { linkDialog as linkDialogMessages } from '../../../foundations/messages/linkDialog.js';
import { richText as richTextMessages } from '../../../foundations/messages/richText.js';
import type { EditorLink } from '../../../internal/editor/LinkDialog.js';
import { useMessages } from '../../../internal/provider/EnvUIContext.js';
import type { RichTextAttachment, RichTextEditorProps } from '../types.js';
import { safeRichTextUrl } from './referenceAttributes.js';

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

const attachmentAsDocumentNode = (attachment: RichTextAttachment) =>
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
  const linkDialogFocusReturn = useRef<HTMLElement | null>(null);
  useEffect(() => {
    linkDialogFocusReturn.current = editor?.view.dom ?? null;
  }, [editor]);
  useEffect(() => {
    pending.current?.abort();
    setBusy(false);
    setLinkRequest(null);
    setStatus('');
    return () => pending.current?.abort();
  }, [editor, disabled, readOnly, value]);

  function abortRunningAndStart() {
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
    const signal = abortRunningAndStart();
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
    const signal = abortRunningAndStart();
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
          attachments.push(attachmentAsDocumentNode(attachment));
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
      const applicationMessage =
        cause instanceof Error && cause.message ? cause.message : undefined;
      if (!signal.aborted) setStatus(applicationMessage ?? messages.uploadFailed);
    } finally {
      if (!signal.aborted) setBusy(false);
    }
  }

  return {
    status,
    busy,
    linkRequest,
    closeLinkRequest: () => setLinkRequest(null),
    focusTarget: linkDialogFocusReturn,
    requestLink,
    upload,
  };
}
