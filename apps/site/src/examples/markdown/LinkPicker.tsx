import { useState } from 'react';
import { Button, Dialog, List } from '@envsemble/envui';
import { MarkdownEditor, type MarkdownLink } from '@envsemble/envui/markdown';

const documents = [
  { title: 'Launch plan', href: '/documents/launch-plan', owner: 'Priya Shah' },
  { title: 'Pricing research', href: '/documents/pricing', owner: 'Sam Lee' },
  { title: 'Release notes', href: '/documents/release-notes', owner: 'Alex Morgan' },
];

export default function LinkPicker() {
  const [notes, setNotes] = useState('Read the launch plan before the review on Friday.');
  // The application's own picker, here a dialog of documents: open while a link is asked for,
  // with the text selected, and the answer the editor waits for.
  const [request, setRequest] = useState<{
    text: string;
    answer: (link: MarkdownLink | null) => void;
  } | null>(null);
  const answer = (link: MarkdownLink | null) => {
    request?.answer(link);
    setRequest(null);
  };
  return (
    <>
      <MarkdownEditor
        label="Notes"
        sizing="content"
        rows={3}
        preview={false}
        toolbar={['bold', 'italic', 'link']}
        value={notes}
        onValueChange={setNotes}
        pickLink={({ selectedText }) =>
          new Promise<MarkdownLink | null>((resolve) =>
            setRequest({ text: selectedText, answer: resolve }),
          )
        }
      />
      <Dialog
        open={request !== null}
        onOpenChange={(open) => {
          if (!open) answer(null);
        }}
        title="Link to a document"
      >
        <List.Root aria-label="Documents">
          {documents.map(({ title, href, owner }) => (
            <List.Item
              key={href}
              interactive
              label={
                <Button
                  variant="text"
                  data-row-target
                  onClick={() => answer({ label: request?.text || title, href })}
                >
                  {title}
                </Button>
              }
              description={owner}
            />
          ))}
        </List.Root>
      </Dialog>
    </>
  );
}
