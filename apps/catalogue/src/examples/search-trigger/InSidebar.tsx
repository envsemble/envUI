import { useMemo, useState } from 'react';
import {
  CommandPalette,
  NavList,
  SearchTrigger,
  Stack,
  Text,
  type CommandPaletteItem,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';

const documents = ['Roadmap', 'Launch checklist', 'Pricing research', 'Interview notes'];

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
    // A sidebar's width, which an application's frame sets.
    <Stack gap={3} style={{ inlineSize: '16rem' }}>
      {/* The catalogue's own search keeps Ctrl+K here; an application's one trigger listens. */}
      <SearchTrigger fullWidth listen={false} onClick={() => setOpen(true)} />
      <nav aria-label="Workspace">
        <NavList.Root>
          <NavList.Item href="/" icon={<Home />} selected>
            Home
          </NavList.Item>
          <NavList.Item href="/projects" icon={<FolderOpen />}>
            Projects
          </NavList.Item>
          <NavList.Item href="/people" icon={<Group />}>
            People
          </NavList.Item>
        </NavList.Root>
      </nav>
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
    </Stack>
  );
}
