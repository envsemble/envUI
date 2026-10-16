import { useMemo, useState } from 'react';
import { CommandPalette, Kbd, Theme, type ThemeValue } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

const recent = ['Roadmap.md', 'Decisions.md'];
const documents = Array.from({ length: 60 }, (_, index) => `Document ${index + 1}.md`);

export function CommandPaletteFixture({ theme }: { theme: ThemeValue }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [log, setLog] = useState('');
  const items = useMemo(() => {
    const match = (name: string) => name.toLowerCase().includes(query.toLowerCase());
    return [
      ...recent.filter(match).map((name) => ({
        id: `recent/${name}`,
        label: name,
        description: 'plans',
        icon: <Description />,
        group: 'Recently opened',
      })),
      ...documents.filter(match).map((name) => ({
        id: `documents/${name}`,
        label: name,
        description: 'documents',
        icon: <Description />,
        group: 'Documents',
      })),
    ];
  }, [query]);
  return (
    <Theme theme={theme} data-testid={`palette-${theme}`} className="fixture-section">
      <button type="button" onClick={() => setOpen(true)}>
        Quick open {theme}
      </button>
      <CommandPalette
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
        aria-label="Go to document"
        placeholder="Search documents"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item, { modifier }) => setLog(`${modifier ? 'side' : 'open'} ${item.id}`)}
        emptyLabel="No matching documents"
        hints={[
          { keys: ['Enter'], label: 'Open' },
          { keys: ['Ctrl', 'Enter'], label: 'Open to the side' },
        ]}
        footer={
          theme === 'dark' ? (
            <>
              Press <Kbd>Esc</Kbd> to close
            </>
          ) : undefined
        }
      />
      <output data-testid={`palette-log-${theme}`}>{log}</output>
    </Theme>
  );
}
