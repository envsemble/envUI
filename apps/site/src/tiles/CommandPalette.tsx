import { useState } from 'react';
import { CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { IconNoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { IconPersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { usePointer, type PointerStep } from '../motion/Motion';

const items: CommandPaletteItem[] = [
  { id: 'new', label: 'New document', icon: <IconNoteAdd /> },
  { id: 'invite', label: 'Invite people', icon: <IconPersonAdd /> },
  { id: 'settings', label: 'Open settings', icon: <IconSettings /> },
];

const input = '.env-command-palette-input';

/** A search typed, which narrows the commands to one; erased, they all come back. */
const script: PointerStep[] = [
  { wait: 500 },
  { type: 'inv', into: input, every: 220 },
  { wait: 1400 },
  { erase: 3, into: input, every: 120 },
  { wait: 900 },
];

/** A command palette, open on its commands. */
export default function CommandPaletteTile() {
  const [query, setQuery] = useState('');
  usePointer(script, { onRest: () => setQuery('') });
  return (
    <CommandPalette
      open
      onOpenChange={() => {}}
      aria-label="Run a command"
      placeholder="Search commands"
      inputValue={query}
      onInputValueChange={setQuery}
      items={items.filter((item) => String(item.label).toLowerCase().includes(query.toLowerCase()))}
      onAction={() => {}}
    />
  );
}
