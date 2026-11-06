import { useState } from 'react';
import { NavigationDrawer, type Destination } from '@envsemble/envui';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconStar } from '@envsemble/envui/icons/Star';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const item = (index: number) =>
  `.env-navigation-drawer-list > li:nth-child(${index}) > .env-navigation-drawer-item`;

/** Starred chosen, the current destination moving to it, and Inbox again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: item(2) },
  { wait: 400 },
  { click: true },
  { wait: 1300 },
  { to: item(1), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 800 },
  { leave: true },
  { wait: 400 },
];

/**
 * The application's frame the drawer stands at the start of: as wide as a window, so a resizable
 * drawer has the room it takes beside the page, which paints nothing here, and as low as the
 * stage shows, so the drawer's resize grip, at the middle of its height, stands between its rows
 * rather than beside one of them.
 */
const frame = { inlineSize: '30rem', blockSize: '6.5rem' } as const;

/**
 * A mail application's drawer of two destinations, Inbox current, both rows whole: resizable, and
 * set narrower than its 15 rem at rest, so it shows whole across a gallery's stage at its own
 * size, its rows inset from the stage's end; on a phone's narrower stage, narrower still.
 */
export default function DrawerTile() {
  const [current, setCurrent] = useState('inbox');
  const narrow = useMedia(narrowGallery);
  usePointer(script);
  const destination = (id: string) => ({
    current: current === id,
    onClick: () => setCurrent(id),
  });
  const destinations: Destination[] = [
    { label: 'Inbox', icon: <IconInbox />, ...destination('inbox') },
    { label: 'Starred', icon: <IconStar />, ...destination('starred') },
  ];
  const width = narrow ? 9.5 : 11.5;
  return (
    <div style={frame}>
      <NavigationDrawer
        aria-label="Mail"
        destinations={destinations}
        resizable
        width={width}
        minWidth={width}
      />
    </div>
  );
}
