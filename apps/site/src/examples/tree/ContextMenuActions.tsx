import { useMemo, useState } from 'react';
import { IconButton, Menu, Column, Tree, type TreeItem } from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Description } from '@envsemble/envui/icons/Description';
import { FileCopy } from '@envsemble/envui/icons/FileCopy';
import { Folder } from '@envsemble/envui/icons/Folder';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';

interface Entry {
  id: string;
  parent: string | null;
  name: string;
  folder?: boolean;
}

const initialEntries: Entry[] = [
  { id: 'design', parent: null, name: 'Design', folder: true },
  { id: 'brand', parent: 'design', name: 'Brand.md' },
  { id: 'research', parent: 'design', name: 'Research.md' },
  { id: 'finance', parent: null, name: 'Finance', folder: true },
  { id: 'budget', parent: 'finance', name: 'Budget.md' },
  { id: 'invoices', parent: 'finance', name: 'Invoices.md' },
  { id: 'readme', parent: null, name: 'Readme.md' },
];

/** Whether an entry lies inside the folder with the given id, at any depth. */
function inside(entries: Entry[], entry: Entry, folder: string) {
  for (let parent = entry.parent; parent !== null; ) {
    if (parent === folder) return true;
    const id: string = parent;
    parent = entries.find((candidate) => candidate.id === id)?.parent ?? null;
  }
  return false;
}

export default function ContextMenuActions() {
  const [entries, setEntries] = useState(initialEntries);
  const [expanded, setExpanded] = useState(() => new Set(['design', 'finance']));
  const [selected, setSelected] = useState<string | null>('budget');
  const rows = useMemo(() => {
    const visible: TreeItem[] = [];
    const visit = (parent: string | null, depth: number) => {
      for (const entry of entries.filter((candidate) => candidate.parent === parent)) {
        const open = expanded.has(entry.id);
        visible.push({
          id: entry.id,
          depth,
          label: entry.name,
          expandable: entry.folder,
          expanded: open,
          icon: entry.folder ? <Folder /> : <Description />,
        });
        if (entry.folder && open) visit(entry.id, depth + 1);
      }
    };
    visit(null, 0);
    return visible;
  }, [entries, expanded]);

  const create = (parent: string | null) => {
    const entry = { id: crypto.randomUUID(), parent, name: 'Untitled.md' };
    setEntries((current) => [...current, entry]);
    if (parent) setExpanded((current) => new Set(current).add(parent));
    setSelected(entry.id);
  };
  const duplicate = (id: string) =>
    setEntries((current) => {
      const index = current.findIndex((entry) => entry.id === id);
      const original = current[index]!;
      const copy = { ...original, id: crypto.randomUUID(), name: `Copy of ${original.name}` };
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
  const remove = (id: string) => {
    setEntries((current) =>
      current.filter((entry) => entry.id !== id && !inside(current, entry, id)),
    );
    if (id === selected) setSelected(null);
  };
  const setFolder = (id: string, open: boolean) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <Column gap={2} style={{ inlineSize: 'min(100%, 20rem)' }}>
      {/* The menu's actions are buttons too, for people who cannot right-click. */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <IconButton
          variant="ghost"
          icon={<NoteAdd />}
          aria-label="New document"
          onClick={() => create(null)}
        />
        <IconButton
          variant="ghost"
          icon={<Delete />}
          aria-label="Delete the selected document"
          disabled={selected === null}
          onClick={() => selected && remove(selected)}
        />
      </div>
      {/* The tree fills its parent's height and scrolls itself. */}
      <div style={{ blockSize: '17rem' }}>
        <Tree
          aria-label="Project files"
          items={rows}
          value={selected}
          onAction={(row) =>
            row.expandable ? setFolder(row.id, !row.expanded) : setSelected(row.id)
          }
          onExpandedChange={(row, open) => setFolder(row.id, open)}
          contextMenuLabel="File actions"
          contextMenu={(row) =>
            row ? (
              <>
                {row.expandable ? (
                  <Menu.Item icon={<NoteAdd />} onClick={() => create(row.id)}>
                    New document here
                  </Menu.Item>
                ) : (
                  <Menu.Item icon={<FileCopy />} onClick={() => duplicate(row.id)}>
                    Duplicate
                  </Menu.Item>
                )}
                <Menu.Separator />
                <Menu.Item icon={<Delete />} onClick={() => remove(row.id)}>
                  Delete
                </Menu.Item>
              </>
            ) : (
              <Menu.Item icon={<NoteAdd />} onClick={() => create(null)}>
                New document
              </Menu.Item>
            )
          }
        />
      </div>
    </Column>
  );
}
