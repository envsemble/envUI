import { useMemo, useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  CommandPalette,
  Kbd,
  Stack,
  Text,
  type CommandPaletteItem,
} from '@envsemble/envui';
import { Bolt } from '@envsemble/envui/icons/Bolt';
import { DarkMode } from '@envsemble/envui/icons/DarkMode';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { PersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { Settings } from '@envsemble/envui/icons/Settings';

const commands: { id: string; label: string; icon: ReactNode; trailing?: ReactNode }[] = [
  { id: 'new', label: 'New document', icon: <NoteAdd />, trailing: <Kbd keys={['Ctrl', 'N']} /> },
  { id: 'invite', label: 'Invite people', icon: <PersonAdd /> },
  {
    id: 'theme',
    label: 'Switch theme',
    icon: <DarkMode />,
    trailing: <Kbd keys={['Ctrl', 'J']} />,
  },
  {
    id: 'settings',
    label: 'Open settings',
    icon: <Settings />,
    trailing: <Kbd keys={['Ctrl', ',']} />,
  },
  {
    id: 'automations',
    label: 'Create an automation',
    icon: <Bolt />,
    trailing: <Badge tone="accent">New</Badge>,
  },
];

export default function RunCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [ran, setRan] = useState('');
  const items = useMemo<CommandPaletteItem[]>(
    () =>
      commands
        .filter((command) => command.label.toLowerCase().includes(query.trim().toLowerCase()))
        .map((command) => ({ ...command, group: 'Commands' })),
    [query],
  );
  return (
    <Stack gap={3} align="start">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Run a command
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
        aria-label="Run a command"
        placeholder="Type a command"
        query={query}
        onQueryChange={setQuery}
        items={items}
        onSelect={(item) => setRan(`Ran: ${commands.find(({ id }) => id === item.id)?.label}`)}
        emptyLabel="No matching commands"
        footer="Shortcuts work anywhere in the workspace."
      />
      <Text variant="caption" emphasis="muted" role="status">
        {ran}
      </Text>
    </Stack>
  );
}
