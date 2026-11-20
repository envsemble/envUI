import { useState } from 'react';
import { DocumentTabs, IconButton, Text, type DocumentTabsItem } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconDescription } from '@envsemble/envui/icons/Description';

const documents: DocumentTabsItem[] = [
  { value: 'roadmap.md', label: 'Roadmap.md', start: <IconDescription /> },
  { value: 'budget.md', label: 'Budget.md', start: <IconDescription /> },
];

export default function DocumentTabsAnatomy() {
  const [tabs, setTabs] = useState(documents);
  const [value, setValue] = useState<string | null>(documents[0]!.value);
  return (
    <div style={{ inlineSize: 'min(100%, 26rem)' }}>
      <DocumentTabs
        aria-label="Open documents"
        items={tabs}
        value={value}
        onValueChange={setValue}
        onClose={(id) => {
          const remaining = tabs.filter((tab) => tab.value !== id);
          setTabs(remaining);
          if (id === value) setValue(remaining[0]?.value ?? null);
        }}
        end={<IconButton icon={<IconAdd />} aria-label="New document" variant="ghost" size="sm" />}
      >
        <Text style={{ padding: '0.75rem 1rem' }}>
          {tabs.find((tab) => tab.value === value)?.label ?? 'No document open'}
        </Text>
      </DocumentTabs>
    </div>
  );
}
