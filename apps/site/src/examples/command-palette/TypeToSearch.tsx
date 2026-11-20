import { useState } from 'react';
import { Button, CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconSearch } from '@envsemble/envui/icons/Search';

const documents = ['Roadmap.md', 'Pricing research.md', 'Launch checklist.md', 'Budget.md'];
const recent: CommandPaletteItem[] = [];

export default function TypeToSearch() {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const items = documents
    .filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
    .map((name) => ({ id: name, label: name, start: <IconDescription /> }));
  return (
    <>
      <Button variant="secondary" start={<IconSearch />} onClick={() => setOpen(true)}>
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
        suggestedItems={recent}
        onAction={() => {}}
        emptyDescription={query.trim() ? undefined : 'Find a document by its name or folder.'}
      />
    </>
  );
}
