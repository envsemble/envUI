import { useState } from 'react';
import { Menu, Menubar } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const menu = (label: string) => `.env-menubar-trigger:nth-child(${label} of .env-menubar-trigger)`;

/** With Edit open, the pointer comes onto File, which opens in its place, and back to Edit. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: menu('1') },
  { wait: 1100 },
  { to: menu('2'), duration: 400 },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

type Open = 'file' | 'edit' | null;

/**
 * An application's menu bar of two menus, two items to a menu, so a gallery's low tile shows the
 * bar and an open menu whole at the popups' scale, the inset from the stage's edges. It rests with
 * its last menu open, the one that reaches furthest along the bar, framed on the bar and that menu,
 * so the other opens within that frame as it plays, and nothing in its tile moves. Two to a row,
 * its items without their shortcuts.
 */
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
