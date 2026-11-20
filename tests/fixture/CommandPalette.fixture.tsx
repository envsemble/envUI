import { useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  CommandPalette,
  EnvUIProvider,
  Kbd,
  Theme,
  type CommandPaletteGroup,
  type CommandPaletteProps,
  type ColorScheme,
} from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';

const recent = ['Roadmap.md', 'Decisions.md'];
const documents = Array.from({ length: 60 }, (_, index) => `Document ${index + 1}.md`);

function ThemedPalette({ theme }: { theme: ColorScheme }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [log, setLog] = useState('');
  const items = useMemo(() => {
    const match = (name: string) => name.toLowerCase().includes(query.toLowerCase());
    return [
      {
        label: 'Recently opened',
        items: recent.filter(match).map((name) => ({
          id: `recent/${name}`,
          label: name,
          description: 'plans',
          icon: <IconDescription />,
        })),
      },
      {
        label: 'Documents',
        items: documents.filter(match).map((name) => ({
          id: `documents/${name}`,
          label: name,
          description: 'documents',
          icon: <IconDescription />,
        })),
      },
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

const pages = ['Home', 'Settings', 'Billing', 'Keyboard shortcuts'];
const suggested: CommandPaletteGroup[] = [
  {
    label: 'Suggested',
    items: ['Home', 'Settings'].map((name) => ({ id: `suggested/${name}`, label: name })),
  },
];

function EmptyPalette({
  name,
  ...props
}: { name: string } & Partial<Omit<CommandPaletteProps, 'items' | 'aria-label'>>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [log, setLog] = useState('');
  const term = query.trim().toLowerCase();
  const items = term
    ? pages
        .filter((page) => page.toLowerCase().includes(term))
        .map((page) => ({ id: `pages/${page}`, label: page }))
    : [];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open {name}
      </button>
      <CommandPalette
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
        aria-label={name}
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item, { modifier }) => setLog(`${modifier ? 'side' : 'open'} ${item.id}`)}
        {...props}
      />
      <output data-testid={`log-${name}`}>{log}</output>
    </>
  );
}

function EmptyStates() {
  return (
    <div className="fixture-section" data-testid="palette-empty">
      <EmptyPalette name="Find a page" />
      <EnvUIProvider
        messages={{
          commandPalette: {
            emptyQuery: 'Začněte psát',
            empty: 'Nic nenalezeno',
            emptyHint: ({ query }) => `Pro „${query}“ nic není.`,
          },
        }}
      >
        <EmptyPalette name="Najít stránku" />
      </EnvUIProvider>
      <EmptyPalette
        name="Go to page"
        suggestedItems={suggested}
        emptyLabel="No matching pages"
        emptyDescription="Try a page's name, such as Billing."
        emptyIcon={null}
      />
      <EmptyPalette name="Search the server" loading />
    </div>
  );
}

export default function CommandPaletteFixture() {
  return (
    <>
      <ThemedPalette theme="light" />
      <ThemedPalette theme="dark" />
      <EmptyStates />
    </>
  );
}

export function PaletteContentFixture() {
  const [query, setQuery] = useState('');
  return (
    <CommandPalette
      open
      onOpenChange={() => undefined}
      aria-label="Search people"
      inputValue={query}
      onInputValueChange={setQuery}
      onAction={() => undefined}
      searchStart={<Badge>In: People</Badge>}
      searchEnd={<Button size="sm">Projects</Button>}
      items={[
        {
          label: (
            <>
              People <Badge>2</Badge>
            </>
          ),
          items: [
            {
              id: 'priya',
              label: 'Priya Shah',
              start: <Avatar name="Priya Shah" size="sm" />,
              itemProps: { 'data-testid': 'priya', title: 'Priya', className: 'fixture-person' },
            },
            {
              id: 'sam',
              label: (
                <>
                  <b>Sam</b> Lee
                </>
              ),
              start: <Avatar name="Sam Lee" size="sm" />,
            },
          ],
        },
      ]}
    />
  );
}
