'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import type { MarkdownEditorProps } from '../../MarkdownEditor.js';
import {
  insertMarkdownLink,
  isMarkdownHref,
  type MarkdownLink,
  type MarkdownSelection,
} from './markdownFormatting.js';

/**
 * MarkdownEditor's Insert link: the link from the built-in dialog or the application's picker,
 * inserted where the selection was, unless the source changed meanwhile. A newer request, or the
 * editor unmounting, drops a pending one. Problems are told through `setStatus`.
 */
export function useMarkdownLink({
  inputRef,
  apply,
  pickLink,
  showSource,
  setStatus,
  messages,
}: {
  /** The source's text area. */
  inputRef: RefObject<HTMLTextAreaElement | null>;
  /** Replaces the selection with the edit, as the history records it; false where it is too long. */
  apply: (before: MarkdownSelection, after: MarkdownSelection) => boolean;
  pickLink: MarkdownEditorProps['pickLink'];
  /** Shows the source, synchronously, so the link goes into a visible text area. */
  showSource: () => void;
  setStatus: (status: string) => void;
  messages: {
    changedWhilePicking: string;
    linkFailed: string;
    tooLong: string;
    pickerFailed: string;
  };
}) {
  // The selection the built-in dialog inserts at, while it is open.
  const [linkSelection, setLinkSelection] = useState<MarkdownSelection | null>(null);
  const [linkPending, setLinkPending] = useState(false);
  const linkRequestVersion = useRef(0);
  useEffect(
    () => () => {
      linkRequestVersion.current++;
    },
    [],
  );

  function insertLink(selection: MarkdownSelection, link: MarkdownLink) {
    if (inputRef.current?.value !== selection.value) {
      setStatus(messages.changedWhilePicking);
      return;
    }
    if (!isMarkdownHref(link.href)) {
      setStatus(messages.linkFailed);
      return;
    }
    try {
      flushSync(showSource);
      if (!apply(selection, insertMarkdownLink(selection, link))) setStatus(messages.tooLong);
    } catch {
      setStatus(messages.linkFailed);
    }
  }

  async function requestLink(selection: MarkdownSelection) {
    if (!pickLink) {
      setLinkSelection(selection);
      return;
    }
    const version = ++linkRequestVersion.current;
    setLinkPending(true);
    try {
      const result = await pickLink({
        selectedText: selection.value.slice(selection.start, selection.end),
      });
      if (linkRequestVersion.current === version && result) insertLink(selection, result);
    } catch {
      if (linkRequestVersion.current === version) setStatus(messages.pickerFailed);
    } finally {
      if (linkRequestVersion.current === version) setLinkPending(false);
    }
  }

  return {
    linkSelection,
    linkPending,
    requestLink,
    /** Inserts the built-in dialog's link and closes it. */
    insertDialogLink(link: MarkdownLink) {
      if (linkSelection) insertLink(linkSelection, link);
      setLinkSelection(null);
    },
    closeDialog: () => setLinkSelection(null),
  };
}
