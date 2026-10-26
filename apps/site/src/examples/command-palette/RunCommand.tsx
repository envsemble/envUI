import { useMemo, useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  CommandPalette,
  Kbd,
  Column,
  Text,
  type CommandPaletteItem,
} from '@envsemble/envui';
import { Bolt } from '@envsemble/envui/icons/Bolt';
import { DarkMode } from '@envsemble/envui/icons/DarkMode';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { PersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { Settings } from '@envsemble/envui/icons/Settings';

const commands: { id: string; label: string; icon: ReactNode; end?: ReactNode }[] = [
  { id: 'new', label: 'New document', icon: <NoteAdd />, end: <Kbd keys={['Ctrl', 'N']} /> },
  { id: 'invite', label: 'Invite people', icon: <PersonAdd /> },
  {
    id: 'theme',
    label: 'Switch theme',
    icon: <DarkMode />,
    end: <Kbd keys={['Ctrl', 'J']} />,
  },
  {
    id: 'settings',
    label: 'Open settings',
    icon: <Settings />,
    end: <Kbd keys={['Ctrl', ',']} />,
  },
  {
    id: 'automations',
    label: 'Create an automation',
    icon: <Bolt />,
    end: <Badge tone="accent">New</Badge>,
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
    <Column gap={3} align="center">
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
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item) => setRan(`Ran: ${commands.find(({ id }) => id === item.id)?.label}`)}
        emptyLabel="No matching commands"
        footer="Shortcuts work anywhere in the workspace."
      />
      <Text variant="caption" emphasis="muted" role="status">
        {ran}
      </Text>
    </Column>
  );
}
