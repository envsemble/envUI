import { useState } from 'react';
import { Button, Column, DocumentTabs, Text, type DocumentTabsItem } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';

const documents: (DocumentTabsItem & { label: string })[] = [
  { value: 'plans/roadmap.md', label: 'Roadmap.md' },
  { value: 'plans/decisions.md', label: 'Decisions.md' },
  { value: 'research/interviews.md', label: 'Interviews.md', preview: true },
  { value: 'releases/october.md', label: 'October release notes.md' },
].map((tab) => ({ ...tab, start: <IconDescription />, tooltip: tab.value }));

const contents: Record<string, string[]> = {
  'plans/roadmap.md': [
    'Ship the pricing page before the March release.',
    'Move billing to the new ledger once the migration passes review.',
  ],
  'plans/decisions.md': ['Keep one plan per team, reviewed every Monday.'],
  'research/interviews.md': ['Six interviews with Northwind admins, notes by Priya Shah.'],
  'releases/october.md': ['What shipped in October, and what moved to November.'],
};

const documentStyle = { minBlockSize: '9rem', padding: '0.75rem 1rem 1rem' } as const;

export default function OpenDocuments() {
  const [tabs, setTabs] = useState(documents);
  const [value, setValue] = useState<string | null>(documents[0].value);
  const active = tabs.find((tab) => tab.value === value);

  const close = (id: string) => {
    const index = tabs.findIndex((tab) => tab.value === id);
    const remaining = tabs.filter((tab) => tab.value !== id);
    setTabs(remaining);
    if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.value ?? null);
  };

  return (
    <DocumentTabs
      aria-label="Open documents"
      items={tabs}
      value={value}
      onValueChange={setValue}
      onClose={close}
      onReorder={(ids) =>
        setTabs((current) => ids.map((id) => current.find((tab) => tab.value === id)!))
      }
      onCloseAll={() => {
        setTabs([]);
        setValue(null);
      }}
      onPin={(id) =>
        setTabs((current) =>
          current.map((tab) => (tab.value === id ? { ...tab, preview: false } : tab)),
        )
      }
    >
      <Column gap={2} style={documentStyle}>
        {active ? (
          <>
            <Text variant="title" render={<h3 />}>
              {active.label.replace(/\.md$/, '')}
            </Text>
            {contents[active.value]?.map((line) => (
              <Text key={line} variant="body-sm" emphasis="default">
                {line}
              </Text>
            ))}
          </>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              setTabs(documents);
              setValue(documents[0].value);
            }}
          >
            Reopen the documents
          </Button>
        )}
      </Column>
    </DocumentTabs>
  );
}
