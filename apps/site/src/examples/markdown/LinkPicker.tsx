import { useState } from 'react';
import { MarkdownEditor, type MarkdownLink } from '@envsemble/envui/content';

/** Stands in for the application's own picker, such as a dialog that searches documents. */
function pickDocument({ selectedText }: { selectedText: string }) {
  return new Promise<MarkdownLink | null>((resolve) =>
    setTimeout(
      () => resolve({ label: selectedText || 'Launch plan', href: '/documents/launch-plan' }),
      600,
    ),
  );
}

export default function LinkPicker() {
  const [notes, setNotes] = useState('Select a word, then press Insert link.');
  return (
    <MarkdownEditor
      label="Notes"
      sizing="content"
      rows={3}
      preview={false}
      toolbar={['bold', 'italic', 'link']}
      value={notes}
      onValueChange={setNotes}
      onRequestLink={pickDocument}
    />
  );
}
