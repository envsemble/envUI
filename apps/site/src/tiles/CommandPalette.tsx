import { useState } from 'react';
import { CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { IconNoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { IconPersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';

const items: CommandPaletteItem[] = [
  { id: 'new', label: 'New document', icon: <IconNoteAdd /> },
  { id: 'invite', label: 'Invite people', icon: <IconPersonAdd /> },
];

const input = '.env-command-palette-input';

/** A search typed, which narrows the commands to one, and erased; another, and erased, as it began. */
const script: PointerStep[] = [
  { wait: 600 },
  { type: 'inv', into: input, every: 220 },
  { wait: 1200 },
  { erase: 3, into: input, every: 120 },
  { wait: 700 },
  { type: 'new', into: input, every: 220 },
  { wait: 1200 },
  { erase: 3, into: input, every: 120 },
  { wait: 900 },
];

/**
 * A command palette, open with its two commands under its search: framed on all of it, so as a
 * search narrows the list and is erased, the palette, which stays at its top, changes in place and
 * nothing in its tile moves.
 */
export default function CommandPaletteTile() {
  const [query, setQuery] = useState('');
  useHeldView();
  usePointer(script, { onRest: () => setQuery('') });
  return (
    <CommandPalette
      open
      onOpenChange={() => {}}
      aria-label="Run a command"
      placeholder="Search"
      inputValue={query}
      onInputValueChange={setQuery}
      items={items.filter((item) => String(item.label).toLowerCase().includes(query.toLowerCase()))}
      onAction={() => {}}
    />
  );
}
