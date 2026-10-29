import { useState } from 'react';
import { Button, CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Search } from '@envsemble/envui/icons/Search';

const documents = ['Roadmap.md', 'Pricing research.md', 'Launch checklist.md', 'Budget.md'];
// Nothing opened yet in this workspace, so there are no recent documents to show.
const recent: CommandPaletteItem[] = [];

export default function TypeToSearch() {
  // Shown open in the docs; start closed, useState(false), to open it from the button.
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const items = documents
    .filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
    .map((name) => ({ id: name, label: name, icon: <Description /> }));
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
        suggestedItems={recent}
        onAction={() => {}}
        // Before people type, the invitation says what the palette finds.
        emptyDescription={query.trim() ? undefined : 'Find a document by its name or folder.'}
      />
    </>
  );
}
