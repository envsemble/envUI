import { useState } from 'react';
import { Menu, Menubar } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

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
 * An application's menu bar, its File menu open, two items to a menu. A gallery's low tile shows
 * the bar and the menu's first item, cut off at its foot, as a window onto the application.
 */
export default function MenubarTile() {
  const [open, setOpen] = useState<Open>('file');
  usePointer(script, { onRest: () => setOpen('file') });
  const opens = (name: Exclude<Open, null>) => ({
    open: open === name,
    onOpenChange: (next: boolean) =>
      setOpen((current) => (next ? name : current === name ? null : current)),
  });
  return (
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="File" {...opens('file')}>
        <Menu.Item shortcut="Ctrl+N">New</Menu.Item>
        <Menu.Item shortcut="Ctrl+O">Open…</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit" {...opens('edit')}>
        <Menu.Item shortcut="Ctrl+Z">Undo</Menu.Item>
        <Menu.Item shortcut="Ctrl+C">Copy</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="View" {...opens('view')}>
        <Menu.Item shortcut="Ctrl++">Zoom in</Menu.Item>
        <Menu.Item shortcut="Ctrl+-">Zoom out</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
