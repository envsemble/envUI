import { useState } from 'react';
import { Menu, Menubar } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const menu = (label: string) => `.env-menubar-trigger:nth-child(${label} of .env-menubar-trigger)`;

const script: PointerStep[] = [
  { wait: 240 },
  { to: menu('1') },
  { wait: 660 },
  { to: menu('2'), duration: 400 },
  { wait: 420 },
  { leave: true },
  { wait: 240 },
];

type Open = 'file' | 'edit' | null;

export default function MenubarTile() {
  const narrow = useMedia(narrowGallery);
  const [open, setOpen] = useState<Open>('edit');
  const keys = (shortcut: string) => (narrow ? undefined : shortcut);
  useHeldView();
  usePointer(script, { onRest: () => setOpen('edit') });
  const opens = (name: Exclude<Open, null>) => ({
    open: open === name,
    onOpenChange: (next: boolean) =>
      setOpen((current) => (next ? name : current === name ? null : current)),
  });
  return (
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="File" {...opens('file')}>
        <Menu.Item shortcut={keys('Ctrl+N')}>New</Menu.Item>
        <Menu.Item shortcut={keys('Ctrl+O')}>Open…</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit" {...opens('edit')}>
        <Menu.Item shortcut={keys('Ctrl+Z')}>Undo</Menu.Item>
        <Menu.Item shortcut={keys('Ctrl+C')}>Copy</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
