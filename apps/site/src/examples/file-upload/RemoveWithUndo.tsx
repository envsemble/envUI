import { useEffect, useRef, useState } from 'react';
import { Button, List, Toast, useToast } from '@envsemble/envui';

interface Attachment {
  name: string;
  size: string;
}

function Files() {
  const toast = useToast();
  const [files, setFiles] = useState(attachments);
  const list = useRef<HTMLUListElement>(null);
  // A removed row takes its button with it, so focus moves to the next row's button, or to the
  // list once it is empty.
  const focusNext = useRef<(() => void) | null>(null);
  useEffect(() => {
    focusNext.current?.();
    focusNext.current = null;
  });

  const remove = (file: Attachment) => {
    const index = files.indexOf(file);
    focusNext.current = () => {
      const buttons = list.current?.querySelectorAll('button') ?? [];
      (buttons[Math.min(index, buttons.length - 1)] ?? list.current)?.focus();
    };
    // Removed at once, with no question first: Undo puts it back where it was.
    setFiles((current) => current.filter((item) => item !== file));
    const id = toast.show({
      message: `${file.name} removed.`,
      action: {
        label: 'Undo',
        onClick: () => {
          setFiles((current) =>
            attachments.filter((item) => item === file || current.includes(item)),
          );
          toast.dismiss(id);
        },
      },
    });
  };

  return (
    <List.Root
      ref={list}
      aria-label="Files"
      tabIndex={-1}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    >
      {files.map((file) => (
        <List.Item
          key={file.name}
          label={file.name}
          description={file.size}
          action={
            <Button variant="text" aria-label={`Remove ${file.name}`} onClick={() => remove(file)}>
              Remove
            </Button>
          }
        />
      ))}
      {files.length === 0 && <List.Item label="No files." />}
    </List.Root>
  );
}

export default function RemoveWithUndo() {
  // An application has one Toast.Provider at its root; the example brings its own.
  return (
    <Toast.Provider>
      <Files />
    </Toast.Provider>
  );
}

const attachments: Attachment[] = [
  { name: 'annual-review.pdf', size: '2.4 MB' },
  { name: 'budget-2026.xlsx', size: '310 KB' },
  { name: 'team-photo.jpg', size: '1.1 MB' },
];
