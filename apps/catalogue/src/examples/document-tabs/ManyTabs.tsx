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
    // A narrow pane: the strip scrolls sideways with the wheel, touch or the arrow keys.
    <div style={{ inlineSize: 'min(100%, 28rem)' }}>
      <DocumentTabs
        aria-label="Northwind documents"
        items={tabs}
        value={value}
        onValueChange={setValue}
        onClose={(id) => {
          const index = tabs.findIndex((tab) => tab.id === id);
          const remaining = tabs.filter((tab) => tab.id !== id);
          setTabs(remaining);
          if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
        }}
      />
    </div>
  );
}
