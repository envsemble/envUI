import { useState } from 'react';
import { Button, CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Search } from '@envsemble/envui/icons/Search';

const documents = ['Roadmap.md', 'Pricing research.md', 'Launch checklist.md', 'Budget.md'];
const recent = documents.slice(0, 3);

export default function ShowRecent() {
  // Shown open in the docs; start closed, useState(false), to open it from the button.
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const names = query
    ? documents.filter((name) => name.toLowerCase().includes(query.toLowerCase()))
    : recent;
  const items: CommandPaletteItem[] = names.map((name) => ({
    id: name,
    label: name,
    icon: <Description />,
    // While the query is empty, the recent documents are a group of their own.
    group: query ? 'Documents' : 'Recently opened',
  }));
  return (
    <>
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
        placeholder="Search documents"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={() => {}}
        emptyLabel="No matching documents"
      />
    </>
  );
}
