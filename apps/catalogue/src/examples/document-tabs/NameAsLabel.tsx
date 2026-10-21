import { useState } from 'react';
import { DocumentTabs, type DocumentTab } from '@envsemble/envui';

// The document's name as the label, and its location as the title, a tooltip.
const documents: DocumentTab[] = [
  { id: 'plans/roadmap.md', label: 'Roadmap.md', title: 'Northwind/Plans/Roadmap.md' },
  { id: 'plans/budget.md', label: 'Budget.md', title: 'Northwind/Plans/Budget.md' },
];

export default function NameAsLabel() {
  const [tabs, setTabs] = useState(documents);
  const [value, setValue] = useState<string | null>(documents[0]!.id);
  return (
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
      <DocumentTabs
        aria-label="Open documents"
        items={tabs}
        value={value}
        onValueChange={setValue}
        onClose={(id) => {
          const remaining = tabs.filter((tab) => tab.id !== id);
          setTabs(remaining);
          if (id === value) setValue(remaining[0]?.id ?? null);
        }}
      />
    </div>
  );
}
