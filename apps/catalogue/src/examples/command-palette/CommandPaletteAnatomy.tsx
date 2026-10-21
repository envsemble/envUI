import { useState } from 'react';
import { CommandPalette, Kbd, type CommandPaletteItem } from '@envsemble/envui';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { PersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { Settings } from '@envsemble/envui/icons/Settings';

const items: CommandPaletteItem[] = [
  {
    id: 'new',
    label: 'New document',
    icon: <NoteAdd />,
    end: <Kbd keys={['Ctrl', 'N']} />,
    group: 'Commands',
  },
  { id: 'invite', label: 'Invite people', icon: <PersonAdd />, group: 'Commands' },
  { id: 'settings', label: 'Open settings', icon: <Settings />, group: 'Commands' },
];

export default function CommandPaletteAnatomy() {
  // Shown open in the docs; start closed, useState(false), and open it from a SearchTrigger.
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      aria-label="Run a command"
      placeholder="Search commands"
      inputValue={query}
      onInputValueChange={setQuery}
      items={items.filter((item) => String(item.label).toLowerCase().includes(query.toLowerCase()))}
      onAction={() => {}}
      hints={[
        { keys: ['Enter'], label: 'Run' },
        { keys: ['Esc'], label: 'Close' },
      ]}
    />
  );
}
