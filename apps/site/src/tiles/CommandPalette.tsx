import { useState } from 'react';
import { CommandPalette, type CommandPaletteItem } from '@envsemble/envui';
import { IconNoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { IconPersonAdd } from '@envsemble/envui/icons/PersonAdd';
import { useMedia } from '../motion/Autoplay';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import type { TileWindow } from './Tiles';

const items: CommandPaletteItem[] = [
  { id: 'new', label: 'New document', icon: <IconNoteAdd /> },
  { id: 'invite', label: 'Invite people', icon: <IconPersonAdd /> },
];

const input = '.env-command-palette-input';

/**
 * Types a search, which narrows the commands to one, and erases it; then another, and erases it, as
 * it began.
 */
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
 * On a phone: types a search that finds the other command, which takes the first one's place, and
 * erases it, as it began. A search that finds nothing would show the palette's message, which is
 * taller than the stage shows.
 */
const narrowScript: PointerStep[] = [
  { wait: 600 },
  { type: 'inv', into: input, every: 220 },
  { wait: 1400 },
  { erase: 3, into: input, every: 120 },
  { wait: 1200 },
];

/**
 * The tiles' window (TileStage.css), with a lower least scale for its popup: a palette with its two
 * commands is taller than a phone's stage at a popup's least.
 */
export const tileWindow: TileWindow = { popupLeast: 0.7 };

/**
 * A command palette, open with its two commands under its search. A phone's lower stage shows it
 * whole too, drawn as small as that takes (tileWindow). It is framed on all of it, so while a
 * search narrows the list and is erased, the palette, which stays at its top, changes in place and
 * nothing in its tile moves.
 */
export default function CommandPaletteTile() {
  const narrow = useMedia(narrowGallery);
  return <Palette key={String(narrow)} narrow={narrow} />;
}

function Palette({ narrow }: { narrow: boolean }) {
  const [query, setQuery] = useState('');
  useHeldView();
  usePointer(narrow ? narrowScript : script, { onRest: () => setQuery('') });
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
