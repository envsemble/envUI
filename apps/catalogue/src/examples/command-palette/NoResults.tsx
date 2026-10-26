import { useState } from 'react';
import { Button, CommandPalette } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Search } from '@envsemble/envui/icons/Search';

const documents = ['Roadmap.md', 'Pricing research.md', 'Launch checklist.md', 'Budget.md'];

export default function NoResults() {
  // Shown open in the docs, with a query that finds nothing; start closed, useState(false), and
  // with an empty query, useState(''), to open it from the button.
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('forecast');
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
        onAction={() => {}}
        emptyLabel="No matching documents"
      />
    </>
  );
}
