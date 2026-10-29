import { useState } from 'react';
import { Button, DocumentTabs, Surface, Text, type DocumentTabsItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

const documents: DocumentTabsItem[] = [
  { value: 'plans/roadmap.md', label: 'Roadmap.md' },
  { value: 'plans/decisions.md', label: 'Decisions.md' },
  { value: 'research/interviews.md', label: 'Interviews.md', preview: true },
  { value: 'releases/october.md', label: 'October release notes and follow-ups.md' },
].map((tab) => ({ ...tab, icon: <Description />, tooltip: tab.value }));

/** The panel below the strip, which the application renders. */
const panel = { minBlockSize: '8rem', padding: '1.5rem' } as const;

export default function OpenDocuments() {
  const [tabs, setTabs] = useState(documents);
  const [value, setValue] = useState<string | null>(documents[0].value);
  const active = tabs.find((tab) => tab.value === value);

  const close = (id: string) => {
    const index = tabs.findIndex((tab) => tab.value === id);
    const remaining = tabs.filter((tab) => tab.value !== id);
    setTabs(remaining);
    // Closing the active tab activates its neighbour.
    if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.value ?? null);
  };

  return (
    <Surface background="default" padding={0}>
      <DocumentTabs
        aria-label="Open documents"
        items={tabs}
        value={value}
        panelId="open-document"
        onValueChange={setValue}
        onClose={close}
        // Drag a tab, or use Move left and Move right in its context menu, to put it elsewhere.
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
      />
      <div id="open-document" role="tabpanel" aria-label={active?.label} style={panel}>
        {active ? (
          <Text emphasis="muted">{active.tooltip}</Text>
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
      </div>
    </Surface>
  );
}
