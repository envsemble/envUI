import { useState } from 'react';
import { Menu, Menubar } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const menu = (label: string) => `.env-menubar-trigger:nth-child(${label} of .env-menubar-trigger)`;

/**
 * With File open, the pointer comes onto Edit, which opens in its place, then View, and back along
 * the bar to File, as it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: menu('2') },
  { wait: 900 },
  { to: menu('3'), duration: 350 },
  { wait: 900 },
  { to: menu('1'), duration: 600 },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
];

type Open = 'file' | 'edit' | 'view' | null;

/**
 * An application's menu bar, its File menu open, two items to a menu, so a gallery's low tile
 * shows the bar and the open menu whole at about their own size; two to a row, its items without
 * their shortcuts, so the last menu shows whole in the narrow stage too.
 */
export default function MenubarTile() {
  const [open, setOpen] = useState<Open>('file');
  const narrow = useMedia(narrowGallery);
  const keys = (shortcut: string) => (narrow ? undefined : shortcut);
  // In a phone's tile, the menus are as narrow as their items, so the bar and an open menu are drawn
  // at their own size there.
  const popup = narrow ? { minInlineSize: '6rem' } : undefined;
  usePointer(script, { onRest: () => setOpen('file') });
  const opens = (name: Exclude<Open, null>) => ({
    open: open === name,
    onOpenChange: (next: boolean) =>
      setOpen((current) => (next ? name : current === name ? null : current)),
  });
  return (
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="File" {...opens('file')} style={popup}>
        <Menu.Item shortcut={keys('Ctrl+N')}>New</Menu.Item>
        <Menu.Item shortcut={keys('Ctrl+O')}>Open…</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit" {...opens('edit')} style={popup}>
        <Menu.Item shortcut={keys('Ctrl+Z')}>Undo</Menu.Item>
        <Menu.Item shortcut={keys('Ctrl+C')}>Copy</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="View" {...opens('view')} style={popup}>
        <Menu.Item shortcut={keys('Ctrl++')}>Zoom in</Menu.Item>
        <Menu.Item shortcut={keys('Ctrl+-')}>Zoom out</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
