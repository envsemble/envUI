import { useMemo, useState } from 'react';
import { Button, CommandPalette, Column, Text, type CommandPaletteGroup } from '@envsemble/envui';
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

  const items = useMemo<CommandPaletteGroup[]>(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const found = documents.filter((document) =>
      words.every((word) => `${document.name} ${document.folder}`.toLowerCase().includes(word)),
    );
    const recent = (document: (typeof documents)[number]) => !query && document.recent;
    const itemOf = (document: (typeof documents)[number]) => ({
      id: `${document.folder}/${document.name}`,
      label: document.name,
      description: document.folder,
      start: <IconDescription />,
    });
    return [
      { label: 'Recently opened', items: found.filter(recent).map(itemOf) },
      { label: 'Documents', items: found.filter((document) => !recent(document)).map(itemOf) },
    ];
  }, [query]);

  return (
    <Column gap={3} align="center">
      <Button variant="secondary" start={<IconSearch />} onClick={() => setOpen(true)}>
        Search
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
