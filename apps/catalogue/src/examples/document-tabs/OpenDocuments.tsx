import { useState } from 'react';
import { Button, DocumentTabs, Surface, Text, type DocumentTab } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

const documents: DocumentTab[] = [
  { id: 'plans/roadmap.md', label: 'Roadmap.md' },
  { id: 'plans/decisions.md', label: 'Decisions.md' },
  { id: 'research/interviews.md', label: 'Interviews.md', preview: true },
  { id: 'releases/october.md', label: 'October release notes and follow-ups.md' },
].map((tab) => ({ ...tab, icon: <Description />, title: tab.id }));

/** The panel below the strip, which the application renders. */
const panel = { minBlockSize: '8rem', padding: '1.5rem' } as const;

export default function OpenDocuments() {
  const [tabs, setTabs] = useState(documents);
  const [value, setValue] = useState<string | null>(documents[0].id);
  const active = tabs.find((tab) => tab.id === value);

  const close = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id);
    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    // Closing the active tab activates its neighbour.
    if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
  };

  return (
    <Surface tone="pane" padding={0}>
      <DocumentTabs
        aria-label="Open documents"
        items={tabs}
        value={value}
        panelId="open-document"
        onValueChange={setValue}
        onClose={close}
        onCloseAll={() => {
          setTabs([]);
          setValue(null);
        }}
        onPin={(id) =>
          setTabs((current) =>
            current.map((tab) => (tab.id === id ? { ...tab, preview: false } : tab)),
          )
        }
      />
      <div id="open-document" role="tabpanel" aria-label={active?.label} style={panel}>
        {active ? (
          <Text tone="muted">{active.title}</Text>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              setTabs(documents);
              setValue(documents[0].id);
            }}
          >
            Reopen the documents
          </Button>
        )}
      </div>
    </Surface>
  );
}
