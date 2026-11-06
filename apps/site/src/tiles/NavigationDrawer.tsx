import { useState } from 'react';
import { Box, NavigationDrawer, type Destination } from '@envsemble/envui';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconStar } from '@envsemble/envui/icons/Star';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const item = (index: number) =>
  `.env-navigation-drawer-list > li:nth-child(${index}) > .env-navigation-drawer-item`;

/**
 * What a drag aims at: the first destination's icon, which stays where it is as the drawer
 * narrows, 1 rem wide and 1.25 rem from the drawer's start, while the handle moves as it drags;
 * a fraction of 2 down is about the middle of the drawer, where its grip is.
 */
const icon = `${item(1)} svg`;

/** Where the handle's middle is for a drawer `width` rem wide, as a fraction of the icon's box. */
const handleAt = (width: number) => width - 0.3 - 1.25;

/** The drawer's width at rest and dragged narrower, in rem, by the stage's width. */
const wide = { width: 11.5, narrowed: 9.5 };
const narrow = { width: 9.5, narrowed: 8.25 };

/**
 * Starred chosen, the current destination moving to it, and Inbox again; then the drawer's resize
 * handle dragged in, the drawer narrowing with it, and back out to its width, as people resize it.
 */
const scriptOf = ({ width, narrowed }: typeof wide): PointerStep[] => [
  { wait: 300 },
  { to: item(2) },
  { wait: 400 },
  { click: true },
  { wait: 1100 },
  { to: item(1), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: icon, x: handleAt(width), y: 2, duration: 450 },
  { wait: 300 },
  { press: true },
  { to: icon, x: handleAt(narrowed), y: 2, duration: 600 },
  { wait: 700 },
  { to: icon, x: handleAt(width), y: 2, duration: 500 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
];
const scripts = { wide: scriptOf(wide), narrow: scriptOf(narrow) };

/**
 * The application's frame the drawer stands at the start of: as wide as a window, so a resizable
 * drawer has the room it takes beside the page, which paints nothing here, and as low as the
 * stage shows, so the drawer's resize grip, at the middle of its height, stands between its rows
 * rather than beside one of them. It is the size container the drawer takes at most half of, as a
 * Scaffold is.
 */
const frame = { inlineSize: '30rem', blockSize: '6.5rem' } as const;

/**
 * A mail application's drawer of two destinations, Inbox current, both rows whole: resizable, and
 * set narrower than its 15 rem at rest, so it shows whole across a gallery's stage at its own
 * size, its rows inset from the stage's end; on a phone's narrower stage, narrower still. As it
 * plays, the pointer drags its grip, so the grip reads as what it is.
 */
export default function DrawerTile() {
  const [current, setCurrent] = useState('inbox');
  const sizes = useMedia(narrowGallery) ? narrow : wide;
  usePointer(sizes === narrow ? scripts.narrow : scripts.wide);
  const destination = (id: string) => ({
    current: current === id,
    onClick: () => setCurrent(id),
  });
  const destinations: Destination[] = [
    { label: 'Inbox', icon: <IconInbox />, ...destination('inbox') },
    { label: 'Starred', icon: <IconStar />, ...destination('starred') },
  ];
  return (
    <Box container="mail" style={frame}>
      <NavigationDrawer
        aria-label="Mail"
        destinations={destinations}
        resizable
        defaultWidth={sizes.width}
        minWidth={sizes.narrowed}
      />
    </Box>
  );
}
