import { useState } from 'react';
import { DocumentTabs, type DocumentTab } from '@envsemble/envui';

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
  const [tabs, setTabs] = useState<DocumentTab[]>(
    names.map((name) => ({ id: name.toLowerCase(), label: `${name}.md` })),
  );
  const [value, setValue] = useState<string | null>('pricing');
  return (
    // The strip scrolls sideways with the wheel, touch or the arrow keys where its tabs don't fit,
    // and they fade at an edge they run past. Drag a tab near an edge to carry it further.
    <DocumentTabs
      aria-label="Northwind documents"
      items={tabs}
      value={value}
      onValueChange={setValue}
      onReorder={(ids) =>
        setTabs((current) => ids.map((id) => current.find((tab) => tab.id === id)!))
      }
      onClose={(id) => {
        const index = tabs.findIndex((tab) => tab.id === id);
        const remaining = tabs.filter((tab) => tab.id !== id);
        setTabs(remaining);
        if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
      }}
    />
  );
}
