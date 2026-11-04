import { useMemo, useState } from 'react';
import { Button, CommandPalette, Column, Text, type CommandPaletteItem } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconSearch } from '@envsemble/envui/icons/Search';

const documents = [
  { name: 'Roadmap.md', folder: 'Plans', recent: true },
  { name: 'Pricing research.md', folder: 'Research', recent: true },
  { name: 'Launch checklist.md', folder: 'Plans/Northwind', recent: true },
  { name: 'Interview notes.md', folder: 'Research/Interviews', recent: false },
  { name: 'Support handbook.md', folder: 'Guides', recent: false },
  { name: 'Quarterly review.md', folder: 'Reports', recent: false },
];

export default function GoToDocument() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState('');

  // The application filters and ranks the items; here, every word of the query must match.
  const items = useMemo<CommandPaletteItem[]>(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return documents
      .filter((document) =>
        words.every((word) => `${document.name} ${document.folder}`.toLowerCase().includes(word)),
      )
      .map((document) => ({
        id: `${document.folder}/${document.name}`,
        label: document.name,
        description: document.folder,
        icon: <IconDescription />,
        group: !query && document.recent ? 'Recently opened' : 'Documents',
      }));
  }, [query]);

  return (
    <Column gap={3} align="center">
      <Button variant="secondary" startIcon={<IconSearch />} onClick={() => setOpen(true)}>
        Go to document
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
        aria-label="Go to document"
        placeholder="Search documents by name or folder"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item, { modifier }) =>
          setOpened(`${modifier ? 'Opened to the side' : 'Opened'}: ${item.id}`)
        }
        emptyLabel="No matching documents"
        hints={[
          { keys: ['Enter'], label: 'Open' },
          { keys: ['Ctrl', 'Enter'], label: 'Open to the side' },
          { keys: ['Esc'], label: 'Close' },
        ]}
      />
      <Text variant="caption" emphasis="muted" role="status">
        {opened}
      </Text>
    </Column>
  );
}
