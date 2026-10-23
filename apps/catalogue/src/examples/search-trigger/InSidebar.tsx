import { useMemo, useState } from 'react';
import {
  Button,
  CommandPalette,
  Drawer,
  Kbd,
  Column,
  Text,
  type CommandPaletteItem,
  type Destination,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons/Search';

/** ⌘ on Apple platforms, Ctrl elsewhere. */
const apple = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);

const documents = ['Roadmap', 'Launch checklist', 'Pricing research', 'Interview notes'];

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/', current: true },
  { label: 'Projects', icon: <FolderOpen />, href: '/projects' },
  { label: 'People', icon: <Group />, href: '/people' },
];

export default function InSidebar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState('');
  const items = useMemo<CommandPaletteItem[]>(
    () =>
      documents
        .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
        .map((name) => ({ id: name, label: name, icon: <Description /> })),
    [query],
  );
  return (
    <Column gap={3}>
      <Drawer
        aria-label="Workspace"
        destinations={destinations}
        header={
          <Button
            variant="secondary"
            fullWidth
            startIcon={<Search />}
            // The keys show the shortcut, which aria-keyshortcuts announces.
            end={<Kbd keys={[apple ? '⌘' : 'Ctrl', 'K']} aria-hidden />}
            aria-keyshortcuts={apple ? 'Meta+K' : 'Control+K'}
            onClick={() => setOpen(true)}
          >
            Search
          </Button>
        }
      />
      <CommandPalette
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
        aria-label="Search"
        placeholder="Search documents"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item) => setOpened(`Opened ${item.label}`)}
        emptyLabel="No matching documents"
      />
      <Text variant="caption" emphasis="muted" role="status">
        {opened}
      </Text>
    </Column>
  );
}
