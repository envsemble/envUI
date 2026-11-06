import { useState } from 'react';
import { CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { IconNoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { IconPersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

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
 * On a phone, one command: a search typed that finds it, and erased, as it began. One that finds
 * none would show the palette's message, taller than the stage shows.
 */
const narrowScript: PointerStep[] = [
  { wait: 600 },
  { type: 'new', into: input, every: 220 },
  { wait: 1400 },
  { erase: 3, into: input, every: 120 },
  { wait: 1200 },
];

/**
 * A command palette, open with its two commands under its search, on a phone's lower stage one:
 * the palette shows whole, its foot in view. Framed on all of it, so as a search narrows the list
 * and is erased, the palette, which stays at its top, changes in place and nothing in its tile
 * moves.
 */
export default function CommandPaletteTile() {
  const narrow = useMedia(narrowGallery);
  return <Palette key={String(narrow)} narrow={narrow} />;
}

function Palette({ narrow }: { narrow: boolean }) {
  const [query, setQuery] = useState('');
  useHeldView();
  usePointer(narrow ? narrowScript : script, { onRest: () => setQuery('') });
  const commands = narrow ? items.slice(0, 1) : items;
  return (
    <CommandPalette
      open
      onOpenChange={() => {}}
      aria-label="Run a command"
      placeholder="Search"
      inputValue={query}
      onInputValueChange={setQuery}
      items={commands.filter((item) =>
        String(item.label).toLowerCase().includes(query.toLowerCase()),
      )}
      onAction={() => {}}
    />
  );
}
