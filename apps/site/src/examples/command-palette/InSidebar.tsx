import { useMemo, useState } from 'react';
import {
  Button,
  CommandPalette,
  NavigationDrawer,
  Kbd,
  Column,
  Text,
  type CommandPaletteItem,
  type Destination,
  useModifierKey,
} from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolderOpen } from '@envsemble/envui/icons/FolderOpen';
import { IconGroup } from '@envsemble/envui/icons/Group';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconSearch } from '@envsemble/envui/icons/Search';

const documents = ['Roadmap', 'Launch checklist', 'Pricing research', 'Interview notes'];

const destinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '/', current: true },
  { label: 'Projects', icon: <IconFolderOpen />, href: '/projects' },
  { label: 'People', icon: <IconGroup />, href: '/people' },
];

export default function InSidebar() {
  const modifier = useModifierKey();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState('');
  const items = useMemo<CommandPaletteItem[]>(
    () =>
      documents
        .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
        .map((name) => ({ id: name, label: name, icon: <IconDescription /> })),
    [query],
  );
  return (
    <Column gap={3}>
      <NavigationDrawer
        aria-label="Workspace"
        destinations={destinations}
        header={
          <Button
            variant="secondary"
            fullWidth
            startIcon={<IconSearch />}
            // The keys show the shortcut, which aria-keyshortcuts announces.
            end={<Kbd keys={[modifier.label, 'K']} aria-hidden />}
            aria-keyshortcuts={`${modifier.key}+K`}
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
