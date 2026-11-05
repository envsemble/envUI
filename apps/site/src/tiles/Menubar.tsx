import { useState } from 'react';
import { Menu, Menubar } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const menu = (label: string) => `.env-menubar-trigger:nth-child(${label} of .env-menubar-trigger)`;

/**
 * With View open, the pointer comes onto Edit, which opens in its place, then File, and back along
 * the bar to View, as it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: menu('2') },
  { wait: 900 },
  { to: menu('1'), duration: 350 },
  { wait: 900 },
  { to: menu('3'), duration: 600 },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
];

/** Two to a row, with Edit open, the pointer comes onto File, which opens in its place, and back. */
const narrowScript: PointerStep[] = [
  { wait: 400 },
  { to: menu('1') },
  { wait: 1100 },
  { to: menu('2'), duration: 400 },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

type Open = 'file' | 'edit' | 'view' | null;

/**
 * An application's menu bar, two items to a menu, so a gallery's low tile shows the bar and an open
 * menu whole at about their own size. It rests with its last menu open, the one that reaches
 * furthest along the bar, framed on the bar and that menu, so the others open within that frame as
 * it plays, and nothing in its tile moves. Two to a row, a shorter bar, File and Edit, its items
 * without their shortcuts, so its last menu shows whole in the narrow stage.
 */
export default function MenubarTile() {
  const narrow = useMedia(narrowGallery);
  const last: Open = narrow ? 'edit' : 'view';
  const [open, setOpen] = useState<Open>(last);
  const keys = (shortcut: string) => (narrow ? undefined : shortcut);
  useHeldView();
  usePointer(narrow ? narrowScript : script, { onRest: () => setOpen(last) });
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
      {!narrow && (
        <Menubar.Menu label="View" {...opens('view')}>
          <Menu.Item shortcut={keys('Ctrl++')}>Zoom in</Menu.Item>
          <Menu.Item shortcut={keys('Ctrl+-')}>Zoom out</Menu.Item>
        </Menubar.Menu>
      )}
    </Menubar.Root>
  );
}
