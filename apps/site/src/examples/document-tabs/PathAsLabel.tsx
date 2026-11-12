import { useState } from 'react';
import { DocumentTabs, type DocumentTabsItem } from '@envsemble/envui';

// Locations as labels: every tab starts the same, and the names are cut off.
const documents: DocumentTabsItem[] = [
  { value: 'plans/roadmap.md', label: 'Northwind/Plans/Roadmap.md' },
  { value: 'plans/budget.md', label: 'Northwind/Plans/Budget.md' },
];

export default function PathAsLabel() {
  const [tabs, setTabs] = useState(documents);
  const [value, setValue] = useState<string | null>(documents[0]!.value);
  return (
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
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
      />
    </div>
  );
}
