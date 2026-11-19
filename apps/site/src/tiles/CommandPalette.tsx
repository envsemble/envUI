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
  { id: 'new', label: 'New document', start: <IconNoteAdd /> },
  { id: 'invite', label: 'Invite people', start: <IconPersonAdd /> },
];

const input = '.env-command-palette-input';

const script: PointerStep[] = [
  { wait: 360 },
  { type: 'inv', into: input, every: 220 },
  { wait: 720 },
  { erase: 3, into: input, every: 120 },
  { wait: 420 },
  { type: 'new', into: input, every: 220 },
  { wait: 720 },
  { erase: 3, into: input, every: 120 },
  { wait: 540 },
];

const narrowScript: PointerStep[] = [
  { wait: 360 },
  { type: 'inv', into: input, every: 220 },
  { wait: 840 },
  { erase: 3, into: input, every: 120 },
  { wait: 720 },
];

export const tileWindow: TileWindow = { popupLeast: 0.7 };

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
