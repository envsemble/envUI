import { useEffect, useRef, useState } from 'react';
import { ConfirmButton, List } from '@envsemble/envui';

export default function RemoveFile() {
  const [files, setFiles] = useState(initialFiles);
  const list = useRef<HTMLUListElement>(null);
  // A removed file takes its button with it, so focus moves to the next file's button, or to the
  // list once it is empty.
  const focusNext = useRef<(() => void) | null>(null);
  useEffect(() => {
    focusNext.current?.();
    focusNext.current = null;
  });

  const remove = (name: string) => {
    const index = files.findIndex((file) => file.name === name);
    focusNext.current = () => {
      const buttons = list.current?.querySelectorAll('button') ?? [];
      (buttons[Math.min(index, buttons.length - 1)] ?? list.current)?.focus();
    };
    setFiles((current) => current.filter((file) => file.name !== name));
  };

  return (
    <List.Root
      ref={list}
      aria-label="Attached files"
      tabIndex={-1}
      style={{ inlineSize: 'min(100%, 24rem)' }}
    >
      {files.map((file) => (
        <List.Item
          key={file.name}
          label={file.name}
          description={file.size}
          end={
            // Little is at stake: the first press arms the button in place, and a second removes
            // the file.
            <ConfirmButton
              size="sm"
              confirmLabel="Remove file"
              aria-label={`Remove ${file.name}`}
              onConfirm={() => remove(file.name)}
            >
              Remove
            </ConfirmButton>
          }
        />
      ))}
      {files.length === 0 && <List.Item label="No files attached." />}
    </List.Root>
  );
}

const initialFiles = [
  { name: 'Budget 2026.xlsx', size: '48 KB' },
  { name: 'Launch brief.pdf', size: '1.2 MB' },
];
