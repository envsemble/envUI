import { useEffect, useRef, useState } from 'react';
import { ConfirmButton, List } from '@envsemble/envui';
import { Close } from '@envsemble/envui/icons/Close';

export default function ConfirmInPlace() {
  const [files, setFiles] = useState(attachments);
  const list = useRef<HTMLUListElement>(null);
  // A removed row takes its button with it, so focus moves to the next row's button, or to the
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
    <List.Root ref={list} aria-label="Attachments of Annual review" tabIndex={-1}>
      {files.map((file) => (
        <List.Item
          key={file.name}
          label={file.name}
          description={file.size}
          action={
            // Low stakes, one item: the first press asks in place, the second removes.
            <ConfirmButton
              variant="ghost"
              icon={<Close />}
              aria-label={`Remove ${file.name}`}
              confirmLabel="Remove file?"
              onConfirm={() => remove(file.name)}
            />
          }
        />
      ))}
      {files.length === 0 && <List.Item label="No attachments." />}
    </List.Root>
  );
}

const attachments = [
  { name: 'annual-review.pdf', size: '2.4 MB' },
  { name: 'budget-2026.xlsx', size: '310 KB' },
  { name: 'team-photo.jpg', size: '1.1 MB' },
];
