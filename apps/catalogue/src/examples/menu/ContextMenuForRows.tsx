import { useEffect, useRef, useState } from 'react';
import { ContextMenu, IconButton, List, Menu, Surface } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Delete } from '@envsemble/envui/icons/Delete';
import { FileCopy } from '@envsemble/envui/icons/FileCopy';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

interface Entry {
  id: string;
  name: string;
  editor: string;
}

const initialEntries: Entry[] = [
  { id: 'report', name: 'Quarterly report', editor: 'Alex Morgan' },
  { id: 'notes', name: 'Meeting notes', editor: 'Sam Lee' },
  { id: 'budget', name: 'Budget', editor: 'Priya Shah' },
];

export default function ContextMenuForRows() {
  const [entries, setEntries] = useState(initialEntries);
  const list = useRef<HTMLUListElement>(null);
  // A deleted row takes its More actions button with it, so focus moves to the next row's, or to
  // the list when it is empty.
  const focusNext = useRef<(() => void) | null>(null);
  useEffect(() => {
    focusNext.current?.();
    focusNext.current = null;
  });
  const add = (entry: Omit<Entry, 'id'>) =>
    setEntries((current) => [...current, { ...entry, id: crypto.randomUUID() }]);
  const remove = (entry: Entry) => {
    const index = entries.findIndex((item) => item.id === entry.id);
    focusNext.current = () => {
      const buttons = list.current?.querySelectorAll('button') ?? [];
      (buttons[Math.min(index, buttons.length - 1)] ?? list.current)?.focus();
    };
    setEntries((current) => current.filter((item) => item.id !== entry.id));
  };

  // The same actions open from each row's button and from a right click on the row.
  const actionsFor = (entry: Entry) => (
    <>
      <Menu.Item
        icon={<FileCopy />}
        shortcut="Ctrl+D"
        onClick={() => add({ ...entry, name: `${entry.name} (copy)` })}
      >
        Duplicate
      </Menu.Item>
      <Menu.Separator />
      <Menu.Item icon={<Delete />} shortcut="Del" onClick={() => remove(entry)}>
        Delete
      </Menu.Item>
    </>
  );

  return (
    <ContextMenu
      aria-label="Document actions"
      content={(target) => {
        const id = target?.closest<HTMLElement>('[data-entry]')?.dataset.entry;
        const entry = entries.find((item) => item.id === id);
        return entry ? (
          actionsFor(entry)
        ) : (
          <Menu.Item
            icon={<Add />}
            onClick={() => add({ name: 'Untitled document', editor: 'Alex Morgan' })}
          >
            New document
          </Menu.Item>
        );
      }}
    >
      <Surface background="default" padding={3} style={{ inlineSize: 'min(100%, 28rem)' }}>
        <List.Root ref={list} aria-label="Documents" tabIndex={-1}>
          {entries.map((entry) => (
            <List.Item
              key={entry.id}
              data-entry={entry.id}
              title={entry.name}
              detail={`Edited by ${entry.editor}`}
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
                  {actionsFor(entry)}
                </Menu.Root>
              }
            />
          ))}
        </List.Root>
      </Surface>
    </ContextMenu>
  );
}
