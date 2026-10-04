import { useRef, useState, type RefObject } from 'react';
import { Dialog } from '../../../feedback/Dialog.js';
import { Button } from '../../../actions/Button.js';
import { Stack } from '../../../foundations/Layout.js';
import { Input } from '../../Input.js';
import { insertMarkdownLink, type MarkdownLink } from './MarkdownFormatting.js';

export function MarkdownLinkDialog({
  selectedText,
  onInsert,
  onCancel,
  finalFocus,
}: {
  selectedText: string;
  onInsert: (link: MarkdownLink) => void;
  onCancel: () => void;
  finalFocus: RefObject<HTMLTextAreaElement | null>;
}) {
  const [label, setLabel] = useState(selectedText);
  const [href, setHref] = useState('');
  const [error, setError] = useState('');
  const hrefInput = useRef<HTMLInputElement>(null);
  function insert() {
    try {
      insertMarkdownLink({ value: '', start: 0, end: 0, direction: 'none' }, { label, href });
      onInsert({ label, href });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enter a valid URL.');
      hrefInput.current?.focus();
    }
  }
  return (
    <Dialog
      open
      title="Insert link"
      initialFocus={hrefInput}
      finalFocus={finalFocus}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      actions={<Button onClick={insert}>Insert link</Button>}
    >
      <Stack>
        <Input label="Text" value={label} onChange={(event) => setLabel(event.target.value)} />
        <Input
          ref={hrefInput}
          label="URL or path"
          value={href}
          error={error || undefined}
          placeholder="https://example.com or /documents/example"
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
      </Stack>
    </Dialog>
  );
}
