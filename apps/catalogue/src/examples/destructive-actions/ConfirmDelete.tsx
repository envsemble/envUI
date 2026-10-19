import { useRef, useState } from 'react';
import { ConfirmDialog, IconButton, List, Menu } from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';
import { FileCopy } from '@envsemble/envui/icons/FileCopy';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

interface DocumentEntry {
  id: string;
  name: string;
  editor: string;
}

export default function ConfirmDelete() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [confirming, setConfirming] = useState(false);
  // The document the dialog asks about; it stays while the dialog closes.
  const [target, setTarget] = useState<DocumentEntry | null>(null);
  const list = useRef<HTMLUListElement>(null);
  // Where focus goes when the dialog closes: the menu button that opened it, or, once its row is
  // deleted, the next row's menu button.
  const returnFocus = useRef<HTMLElement | null>(null);

  const menuButtons = () =>
    Array.from(list.current?.querySelectorAll<HTMLElement>('[aria-haspopup="menu"]') ?? []);

  const confirmDelete = () => {
    if (!target) return;
    const index = documents.indexOf(target);
    const others = menuButtons().filter((_, position) => position !== index);
    returnFocus.current = others[Math.min(index, others.length - 1)] ?? list.current;
    // The document is deleted on a server; the application would return its promise here, so the
    // dialog waits for it.
    setDocuments((current) => current.filter((entry) => entry.id !== target.id));
  };

  return (
    <>
      <List.Root ref={list} aria-label="Documents" tabIndex={-1}>
        {documents.map((entry, index) => (
          <List.Item
            key={entry.id}
            label={entry.name}
            description={`Edited by ${entry.editor}`}
            action={
              <Menu.Root
                aria-label={`Actions for ${entry.name}`}
                trigger={
                  <IconButton
                    variant="ghost"
                    icon={<MoreVert />}
                    aria-label={`More actions for ${entry.name}`}
                  />
                }
              >
                <Menu.Item
                  icon={<FileCopy />}
                  onClick={() =>
                    setDocuments((current) => [
                      ...current,
                      { ...entry, id: crypto.randomUUID(), name: `${entry.name} (copy)` },
                    ])
                  }
                >
                  Duplicate
                </Menu.Item>
                <Menu.Separator />
                {/* envUI has no danger menu item yet: the label names the consequence, and the
                    ellipsis says a confirmation follows. */}
                <Menu.Item
                  icon={<Delete />}
                  onClick={() => {
                    returnFocus.current = menuButtons()[index] ?? null;
                    setTarget(entry);
                    setConfirming(true);
                  }}
                >
                  Delete document…
                </Menu.Item>
              </Menu.Root>
            }
          />
        ))}
        {documents.length === 0 && <List.Item label="No documents." />}
      </List.Root>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        title={`Delete ${target?.name ?? 'document'}?`}
        description="This deletes the document and its comments for everyone. You can’t undo this."
        confirmLabel="Delete document"
        finalFocus={returnFocus}
        onConfirm={confirmDelete}
      />
    </>
  );
}

const initialDocuments: DocumentEntry[] = [
  { id: 'brief', name: 'Launch brief', editor: 'Alex Morgan' },
  { id: 'notes', name: 'Meeting notes', editor: 'Sam Lee' },
  { id: 'budget', name: 'Budget 2026', editor: 'Priya Shah' },
];
