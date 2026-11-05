import { useState } from 'react';
import { NavigationDrawer, type Destination } from '@envsemble/envui';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSend } from '@envsemble/envui/icons/Send';
import { IconStar } from '@envsemble/envui/icons/Star';
import { usePointer, type PointerStep } from '../motion/Motion';

const item = (index: number) =>
  `.env-navigation-drawer-list > li:nth-child(${index}) > .env-navigation-drawer-item`;

/** Starred chosen, then Sent, the current destination moving with each, and Inbox again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: item(2) },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { to: item(3), duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { to: item(1), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/**
 * A drawer of three rows is taller than a gallery's low tile at its own size: it is drawn at four
 * fifths of it, as an application's frame is (Scaffold.tsx), so every row the pointer chooses
 * shows whole.
 */
const smaller = { transform: 'scale(0.8)', transformOrigin: '0 0' } as const;

/** A mail application's drawer of three destinations, Inbox current. */
export default function DrawerTile() {
  const [current, setCurrent] = useState('inbox');
  usePointer(script);
  const destination = (id: string) => ({
    current: current === id,
    onClick: () => setCurrent(id),
  });
  const destinations: Destination[] = [
    { label: 'Inbox', icon: <IconInbox />, count: 12, ...destination('inbox') },
    { label: 'Starred', icon: <IconStar />, ...destination('starred') },
    { label: 'Sent', icon: <IconSend />, ...destination('sent') },
  ];
  return (
    <div style={smaller}>
      <NavigationDrawer
        aria-label="Mail"
        destinations={destinations}
        style={{ inlineSize: '15rem' }}
      />
    </div>
  );
}
