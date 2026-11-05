import { useState } from 'react';
import { CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { IconNoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { IconPersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { usePointer, type PointerStep } from '../motion/Motion';

const items: CommandPaletteItem[] = [
  { id: 'new', label: 'New document', icon: <IconNoteAdd /> },
  { id: 'invite', label: 'Invite people', icon: <IconPersonAdd /> },
];

const input = '.env-command-palette-input';

/** What it rests on: a search typed, narrowed to one command. */
const resting = 'inv';

/** The search erased, which brings back every command, and another typed, then the first again. */
const script: PointerStep[] = [
  { wait: 900 },
  { erase: 3, into: input, every: 120 },
  { wait: 700 },
  { type: 'new', into: input, every: 220 },
  { wait: 1200 },
  { erase: 3, into: input, every: 120 },
  { type: resting, into: input, every: 220 },
  { wait: 900 },
];

/**
 * A command palette, open on a search that has narrowed its commands to one: its field and that
 * result, so a gallery's low tile shows it whole at about its own size.
 */
export default function CommandPaletteTile() {
  const [query, setQuery] = useState(resting);
  usePointer(script, { onRest: () => setQuery(resting) });
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
