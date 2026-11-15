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

export function useMarkdownLink({
  inputRef,
  apply,
  pickLink,
  showSource,
  setStatus,
  messages,
}: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  apply: (before: MarkdownSelection, after: MarkdownSelection) => boolean;
  pickLink: MarkdownEditorProps['pickLink'];
  showSource: () => void;
  setStatus: (status: string) => void;
  messages: {
    changedWhilePicking: string;
    linkFailed: string;
    tooLong: string;
    pickerFailed: string;
  };
}) {
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
    insertDialogLink(link: MarkdownLink) {
      if (linkSelection) insertLink(linkSelection, link);
      setLinkSelection(null);
    },
    closeDialog: () => setLinkSelection(null),
  };
}
