import { useEffect, useState } from 'react';
import {
  DocumentTabs,
  Menu,
  Menubar,
  Theme,
  type DocumentTabsItem,
  type ColorScheme,
} from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';

const initialTabs: DocumentTabsItem[] = [
  { value: 'plans/roadmap.md', label: 'Roadmap.md' },
  { value: 'plans/decisions.md', label: 'Decisions.md' },
  { value: 'plans/retrospective.md', label: 'Retrospective.md', preview: true },
  ...Array.from({ length: 7 }, (_, index) => ({
    value: `notes/note-${index + 1}.md`,
    label: `A rather long note title number ${index + 1}.md`,
  })),
].map((tab) => ({ ...tab, icon: <IconDescription />, tooltip: tab.value }));

export function DocumentTabsFixture({ theme }: { theme: ColorScheme }) {
  const [tabs, setTabs] = useState(initialTabs);
  const [value, setValue] = useState<string | null>('plans/roadmap.md');
  const [log, setLog] = useState<string[]>([]);
  const record = (entry: string) => setLog((current) => [...current.slice(-4), entry]);
  const close = (id: string) => {
    const index = tabs.findIndex((tab) => tab.value === id);
    const remaining = tabs.filter((tab) => tab.value !== id);
    setTabs(remaining);
    if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.value ?? null);
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
              current.map((tab) => (tab.value === id ? { ...tab, preview: false } : tab)),
            );
            record(`pin ${id}`);
          }}
          // The dark strip leaves onCloseAll out: only its tabs offer a menu, with Close alone.
          onCloseAll={
            theme === 'light'
              ? () => {
                  setTabs([]);
                  setValue(null);
                  record('close all');
                }
              : undefined
          }
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

/** An overflowing DocumentTabs strip in right-to-left text, mounted with ?fixture=rtl-document-tabs. */
export function RtlDocumentTabsFixture() {
  const [value, setValue] = useState<string | null>(initialTabs[0]!.value);
  return (
    <div dir="rtl" style={{ inlineSize: '30rem' }}>
      <DocumentTabs
        aria-label="Right-to-left documents"
        items={initialTabs}
        value={value}
        onValueChange={setValue}
        onClose={() => undefined}
      />
    </div>
  );
}

/**
 * A parent that re-renders DocumentTabs with a new inline items array as its menu opens, as its
 * input changes and on a timer, mounted with ?fixture=document-tabs-rerender.
 */
export function DocumentTabsRerenderFixture() {
  const [tabs, setTabs] = useState(['one', 'two', 'three']);
  const [value, setValue] = useState<string | null>('one');
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [renders, setRenders] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setRenders((count) => count + 1), 50);
    return () => clearInterval(timer);
  }, []);
  return (
    <div>
      <DocumentTabs
        aria-label="Re-rendered documents"
        items={tabs.map((id) => ({ value: id, label: `${id}.md` }))}
        value={value}
        onValueChange={setValue}
        onClose={(id) => {
          const index = tabs.indexOf(id);
          const remaining = tabs.filter((tab) => tab !== id);
          setTabs(remaining);
          if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)] ?? null);
        }}
      />
      <Menubar.Root aria-label="Rerender menubar">
        <Menubar.Menu label="File" onOpenChange={setMenuOpen}>
          <Menu.Item>First action</Menu.Item>
          <Menu.Item>Second action</Menu.Item>
        </Menubar.Menu>
      </Menubar.Root>
      <input aria-label="Draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
      <output data-testid="rerender-state">{menuOpen ? 'open' : 'closed'}</output>
      <output data-testid="rerender-count">{renders}</output>
    </div>
  );
}
