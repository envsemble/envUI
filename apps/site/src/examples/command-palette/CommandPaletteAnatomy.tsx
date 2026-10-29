import { useState } from 'react';
import { CommandPalette, Kbd, type CommandPaletteItem } from '@envsemble/envui';
import { IconNoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { IconPersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { IconSettings } from '@envsemble/envui/icons/Settings';

const items: CommandPaletteItem[] = [
  {
    id: 'new',
    label: 'New document',
    icon: <IconNoteAdd />,
    end: <Kbd keys={['Ctrl', 'N']} />,
    group: 'Commands',
  },
  { id: 'invite', label: 'Invite people', icon: <IconPersonAdd />, group: 'Commands' },
  { id: 'settings', label: 'Open settings', icon: <IconSettings />, group: 'Commands' },
];

export default function CommandPaletteAnatomy() {
  // Shown open in the docs; start closed, useState(false), and open it from a search trigger.
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
