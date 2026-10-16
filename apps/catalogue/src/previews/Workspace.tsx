import { useMemo, useState } from 'react';
import {
  Button,
  CommandPalette,
  DocumentTabs,
  Surface,
  Text,
  type DocumentTab,
  Kbd,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Search } from '@envsemble/envui/icons/Search';
import { Example } from './Example';
import { Preview } from './Preview';

const areas = ['Decisions', 'Plans', 'Research', 'Releases', 'Retrospectives', 'Specifications'];
const topics = ['Billing', 'Catalogue', 'Onboarding', 'Search', 'Sharing', 'Sync'];

const openDocuments: DocumentTab[] = [
  { id: 'plans/search/roadmap.md', label: 'Roadmap.md' },
  { id: 'plans/search/decisions.md', label: 'Decisions.md' },
  { id: 'research/sync/interviews.md', label: 'Interviews.md', preview: true },
  { id: 'releases/2026-10.md', label: 'October release notes and follow-ups.md' },
  { id: 'specifications/sharing.md', label: 'Sharing.md' },
].map((tab) => ({ ...tab, icon: <Description />, title: tab.id }));

export function DocumentTabsPreview() {
  const [tabs, setTabs] = useState(openDocuments);
  const [value, setValue] = useState<string | null>(openDocuments[0]!.id);
  const active = tabs.find((tab) => tab.id === value);
  return (
    <Preview>
      <Example
        title="Open documents"
        size="wide"
        caption={
          <>
            Click or use <Kbd>←</Kbd> and <Kbd>→</Kbd> to switch, double-click the italic preview
            tab to keep it, and close with the button, a middle click or <Kbd>Delete</Kbd>. Right
            click or <Kbd>Shift</Kbd>+<Kbd>F10</Kbd> to close one or all tabs from the menu.
          </>
        }
      >
        <Surface tone="pane" padding={0} className="docs-document-tabs">
          <DocumentTabs
            aria-label="Open documents"
            items={tabs}
            value={value}
            panelId="docs-document-panel"
            onValueChange={setValue}
            onClose={(id) => {
              const index = tabs.findIndex((tab) => tab.id === id);
              const remaining = tabs.filter((tab) => tab.id !== id);
              setTabs(remaining);
              if (id === value)
                setValue(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
            }}
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
          <div id="docs-document-panel" role="tabpanel" className="docs-document-panel">
            {active ? (
              <Text tone="muted">{active.title}</Text>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setTabs(openDocuments);
                  setValue(openDocuments[0]!.id);
                }}
              >
                Reopen the sample documents
              </Button>
            )}
          </div>
        </Surface>
      </Example>
    </Preview>
  );
}

const paletteDocuments = areas.flatMap((area) =>
  topics.map((topic) => ({
    name: `${topic} ${area.toLowerCase()}.md`,
    folder: `${area}/${topic}`,
  })),
);

export function CommandPalettePreview() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [lastAction, setLastAction] = useState('');
  const items = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = paletteDocuments.filter((document) =>
      words.every((word) => `${document.name} ${document.folder}`.toLowerCase().includes(word)),
    );
    return matches.map((document, index) => ({
      id: `${document.folder}/${document.name}`,
      label: document.name,
      detail: document.folder,
      icon: <Description />,
      group: !query && index < 3 ? 'Recently opened' : 'Documents',
    }));
  }, [query]);
  return (
    <Preview>
      <Example
        title="Quick open"
        size="collection"
        caption={
          <>
            The application filters and ranks the items; the palette moves the highlight with{' '}
            <Kbd>↑</Kbd> and <Kbd>↓</Kbd>, selects with <Kbd>Enter</Kbd> or a click, and reports{' '}
            <Kbd>Ctrl</Kbd> or <Kbd>Cmd</Kbd> as a modifier.
          </>
        }
      >
        <Button variant="secondary" startIcon={<Search />} onClick={() => setOpen(true)}>
          Go to document
        </Button>
        <CommandPalette
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setQuery('');
          }}
          aria-label="Go to document"
          placeholder="Search documents by name or folder"
          query={query}
          onQueryChange={setQuery}
          items={items}
          onSelect={(item, { modifier }) =>
            setLastAction(`${modifier ? 'Opened to the side' : 'Opened'} ${item.id}`)
          }
          emptyLabel="No matching documents"
          hints={[
            { keys: ['Enter'], label: 'Open' },
            { keys: ['Ctrl', 'Enter'], label: 'Open to the side' },
            { keys: ['Esc'], label: 'Close' },
          ]}
        />
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {lastAction}
        </Text>
      </Example>
    </Preview>
  );
}
