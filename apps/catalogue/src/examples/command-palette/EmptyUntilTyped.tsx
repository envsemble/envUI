import { useState } from 'react';
import { Button, CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Search } from '@envsemble/envui/icons/Search';

const documents = ['Roadmap.md', 'Pricing research.md', 'Launch checklist.md', 'Budget.md'];

export default function EmptyUntilTyped() {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  // Wrong: nothing to choose until people type, though they often want a recent document.
  const names = query
    ? documents.filter((name) => name.toLowerCase().includes(query.toLowerCase()))
    : [];
  const items: CommandPaletteItem[] = names.map((name) => ({
    id: name,
    label: name,
    icon: <Description />,
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
        emptyLabel="Type to search"
      />
    </>
  );
}
