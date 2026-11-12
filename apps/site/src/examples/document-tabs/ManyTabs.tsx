import { useState } from 'react';
import { DocumentTabs, type DocumentTabsItem } from '@envsemble/envui';

const names = [
  'Overview',
  'Budget',
  'Timeline',
  'Risks',
  'Interviews',
  'Survey results',
  'Pricing',
  'Launch checklist',
  'Retrospective',
];

export default function ManyTabs() {
  const [tabs, setTabs] = useState<DocumentTabsItem[]>(
    names.map((name) => ({ value: name.toLowerCase(), label: `${name}.md` })),
  );
  const [value, setValue] = useState<string | null>('budget');
  return (
    // The strip scrolls sideways with the wheel, touch or the arrow keys where its tabs don't fit,
    // and they fade at an edge they run past. Drag a tab near an edge to carry it further.
    <DocumentTabs
      aria-label="Northwind documents"
      items={tabs}
      value={value}
      onValueChange={setValue}
      onReorder={(ids) =>
        setTabs((current) => ids.map((id) => current.find((tab) => tab.value === id)!))
      }
      onClose={(id) => {
        const index = tabs.findIndex((tab) => tab.value === id);
        const remaining = tabs.filter((tab) => tab.value !== id);
        setTabs(remaining);
        if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.value ?? null);
      }}
    />
  );
}
