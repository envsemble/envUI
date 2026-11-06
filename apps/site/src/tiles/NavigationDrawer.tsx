import { useState } from 'react';
import { Box, Column, NavigationDrawer, Text, type Destination } from '@envsemble/envui';
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
const wide = { width: 9, narrowed: 6.5 };
const narrow = { width: 7.5, narrowed: 5.75 };

/**
 * Starred chosen, the current destination moving to it, and Inbox again; then the drawer's resize
 * handle dragged in to its least width and held there, the drawer narrowing with it and the open
 * message beside it rewrapping into the room it gives, and back out to its width, as people resize
 * it.
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
  { to: icon, x: handleAt(narrowed), y: 2, duration: 900 },
  { wait: 1500 },
  { to: icon, x: handleAt(width), y: 2, duration: 800 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
];
const scripts = { wide: scriptOf(wide), narrow: scriptOf(narrow) };

/**
 * The application's frame the drawer stands at the start of: as wide as a window, so a resizable
 * drawer has the room it takes beside the page, the message open in it, and as low as the stage
 * shows, so the drawer's resize grip, at the middle of its height, stands between its rows rather
 * than beside one of them. It is the size container the drawer takes at most half of, as a
 * Scaffold is.
 */
const frame = { inlineSize: '20rem', blockSize: '6.5rem', display: 'flex' } as const;

/**
 * A mail application's drawer of two destinations, Inbox current, both rows whole: resizable, and
 * set narrower than its 15 rem at rest, so it shows whole across a gallery's stage at its own
 * size with the start of the open message beside it; on a phone's narrower stage, narrower still.
 * As it plays, the pointer drags its grip, so the grip reads as what it is, and the message takes
 * the room the drawer gives up.
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
      <Column gap={1} padding={4} style={{ flex: 1, minInlineSize: 0 }}>
        <Text variant="title">Weekly sync</Text>
        <Text variant="body-sm" emphasis="muted">
          Thursday at 10: the launch plan, two open roles and the budget for next quarter.
        </Text>
      </Column>
    </Box>
  );
}
