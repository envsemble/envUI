import { useState } from 'react';
import { CommandPalette, Kbd, type CommandPaletteItem } from '@envsemble/envui';
import { IconNoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { IconPersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { IconSettings } from '@envsemble/envui/icons/Settings';

const items: CommandPaletteItem[] = [
  {
    id: 'new',
    label: 'New document',
    start: <IconNoteAdd />,
    end: <Kbd keys={['Ctrl', 'N']} />,
  },
  { id: 'invite', label: 'Invite people', start: <IconPersonAdd /> },
  { id: 'settings', label: 'Open settings', start: <IconSettings /> },
];

export default function CommandPaletteAnatomy() {
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
      items={[
        {
          label: 'Commands',
          items: items.filter((item) =>
            String(item.label).toLowerCase().includes(query.toLowerCase()),
          ),
        },
      ]}
      onAction={() => {}}
      hints={[
        { keys: ['Enter'], label: 'Run' },
        { keys: ['Esc'], label: 'Close' },
      ]}
    />
  );
}
