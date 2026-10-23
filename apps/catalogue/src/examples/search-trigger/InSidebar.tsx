import { useMemo, useState } from 'react';
import {
  CommandPalette,
  Drawer,
  SearchTrigger,
  Column,
  Text,
  type CommandPaletteItem,
  type Destination,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';

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
        // The catalogue's own search keeps Ctrl+K here; an application's one trigger listens.
        header={<SearchTrigger fullWidth listen={false} onClick={() => setOpen(true)} />}
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
