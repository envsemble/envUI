import { useMemo, useState } from 'react';
import { Button, CommandPalette, Stack, Text, type CommandPaletteItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Search } from '@envsemble/envui/icons/Search';

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
        detail: document.folder,
        icon: <Description />,
        group: !query && document.recent ? 'Recently opened' : 'Documents',
      }));
  }, [query]);

  return (
    <Stack gap={3} align="start">
      <Button variant="secondary" startIcon={<Search />} onClick={() => setOpen(true)}>
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
        query={query}
        onQueryChange={setQuery}
        items={items}
        onSelect={(item, { modifier }) =>
          setOpened(`${modifier ? 'Opened to the side' : 'Opened'}: ${item.id}`)
        }
        emptyLabel="No matching documents"
        hints={[
          { keys: ['Enter'], label: 'Open' },
          { keys: ['Ctrl', 'Enter'], label: 'Open to the side' },
          { keys: ['Esc'], label: 'Close' },
        ]}
      />
      <Text variant="caption" tone="muted" role="status">
        {opened}
      </Text>
    </Stack>
  );
}
