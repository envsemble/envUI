import { useState } from 'react';
import { DocumentTabs, IconButton, type DocumentTabsItem } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Description } from '@envsemble/envui/icons/Description';

const documents: DocumentTabsItem[] = [
  { value: 'roadmap.md', label: 'Roadmap.md', icon: <Description /> },
  { value: 'budget.md', label: 'Budget.md', icon: <Description /> },
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
        end={<IconButton icon={<Add />} aria-label="New document" variant="ghost" size="sm" />}
      />
    </div>
  );
}
