'use client';

import { useRef, useState, type RefObject } from 'react';
import { Button } from '../../actions/Button.js';
import { Dialog } from '../../feedback/Dialog.js';
import { Column } from '../../foundations/Layout.js';
import { linkDialog as linkDialogMessages } from '../../foundations/messages/linkDialog.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { TextField } from '../TextField.js';

/** A link to insert: its text, and where it leads. */
export interface EditorLink {
  label: string;
  href: string;
}

/**
 * The Insert link dialog MarkdownEditor and RichTextEditor share: the link's text, from the
 * selection, and its destination, which `isValid` checks before the link is inserted. Its words come
 * from EnvUIProvider's messages.linkDialog.
 */
export function LinkDialog({
  selectedText,
  isValid,
  onInsert,
  onCancel,
  finalFocus,
}: {
  selectedText: string;
  /** Whether the editor can link to this destination, such as a URL or a relative path. */
  isValid: (href: string) => boolean;
  onInsert: (link: EditorLink) => void;
  onCancel: () => void;
  finalFocus: RefObject<HTMLElement | null>;
}) {
  const messages = useMessages('linkDialog', linkDialogMessages);
  const [label, setLabel] = useState(selectedText);
  const [href, setHref] = useState('');
  const [error, setError] = useState('');
  const hrefInput = useRef<HTMLInputElement>(null);
  function insert() {
    if (!href.trim()) setError(messages.invalidUrl);
    else if (!isValid(href)) setError(messages.invalidPath);
    else {
      onInsert({ label, href });
      return;
    }
    hrefInput.current?.focus();
  }
  return (
    <Dialog
      open
      title={messages.title}
      initialFocus={hrefInput}
      finalFocus={finalFocus}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      actions={<Button onClick={insert}>{messages.insert}</Button>}
    >
      <Column gap={4}>
        <TextField
          label={messages.text}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <TextField
          ref={hrefInput}
          label={messages.url}
          value={href}
          error={error || undefined}
          placeholder={messages.urlPlaceholder}
          onChange={(event) => {
            setHref(event.target.value);
            setError('');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              insert();
            }
          }}
        />
      </Column>
    </Dialog>
  );
}
