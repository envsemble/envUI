import { useState } from 'react';
import { Button, CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconSearch } from '@envsemble/envui/icons/Search';

const documents = ['Roadmap.md', 'Pricing research.md', 'Launch checklist.md', 'Budget.md'];

const item = (name: string, group: string): CommandPaletteItem => ({
  id: name,
  label: name,
  icon: <IconDescription />,
  group,
});
// Until people type, the recent documents show, as a group of their own.
const recent = documents.slice(0, 3).map((name) => item(name, 'Recently opened'));

export default function ShowRecent() {
  // Shown open in the docs; start closed, useState(false), to open it from the button.
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const items = documents
    .filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
    .map((name) => item(name, 'Documents'));
  return (
    <>
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
        placeholder="Search documents"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        suggestedItems={recent}
        onAction={() => {}}
        emptyLabel="No matching documents"
      />
    </>
  );
}
