import { useState } from 'react';
import { DocumentTabs, Theme, type DocumentTab, type ThemeValue } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

const initialTabs: DocumentTab[] = [
  { id: 'plans/roadmap.md', label: 'Roadmap.md' },
  { id: 'plans/decisions.md', label: 'Decisions.md' },
  { id: 'plans/retrospective.md', label: 'Retrospective.md', preview: true },
  ...Array.from({ length: 7 }, (_, index) => ({
    id: `notes/note-${index + 1}.md`,
    label: `A rather long note title number ${index + 1}.md`,
  })),
].map((tab) => ({ ...tab, icon: <Description />, title: tab.id }));

export function DocumentTabsFixture({ theme }: { theme: ThemeValue }) {
  const [tabs, setTabs] = useState(initialTabs);
  const [value, setValue] = useState<string | null>('plans/roadmap.md');
  const [log, setLog] = useState<string[]>([]);
  const record = (entry: string) => setLog((current) => [...current.slice(-4), entry]);
  const close = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id);
    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
    record(`close ${id}`);
  };
  return (
    <Theme
      theme={theme}
      data-testid={`document-tabs-${theme}`}
      className="fixture-section"
      onKeyDown={(event) => {
        // The application's own close shortcut, like Ctrl+W in a desktop app.
        if (event.altKey && event.code === 'KeyW' && value) {
          event.preventDefault();
          close(value);
        }
      }}
    >
      <div className="fixture-tabs-frame">
        <DocumentTabs
          aria-label={`Open documents ${theme}`}
          items={tabs}
          value={value}
          panelId={`document-panel-${theme}`}
          onValueChange={(id) => {
            setValue(id);
            record(`select ${id}`);
          }}
          onClose={close}
          onPin={(id) => {
            setTabs((current) =>
              current.map((tab) => (tab.id === id ? { ...tab, preview: false } : tab)),
            );
            record(`pin ${id}`);
          }}
        />
        <div id={`document-panel-${theme}`} role="tabpanel" className="fixture-tab-panel">
          {value}
        </div>
      </div>
      <button type="button" onClick={() => setValue('notes/note-7.md')}>
        Activate the last note
      </button>
      <output data-testid={`document-tabs-log-${theme}`}>{log.join('\n')}</output>
    </Theme>
  );
}
