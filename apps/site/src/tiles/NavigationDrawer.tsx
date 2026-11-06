import { useState } from 'react';
import { Box, Column, NavigationDrawer, Text, type Destination } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const item = (index: number) =>
  `.env-navigation-drawer-list > li:nth-child(${index}) > .env-navigation-drawer-item`;

/**
 * What a drag aims at: the drawer's frame, which stays where it is as the drawer narrows, while
 * the handle moves as it drags; its middle, about where the drawer's grip is.
 */
const frameSelector = '[data-env-container]';

/** The drawer's frame, its width at rest and dragged narrower, in rem, by the stage's width. */
const wide = { frame: 12.5, width: 6.25, narrowed: 4.75 };
const narrow = { frame: 10.75, width: 5.375, narrowed: 4.5 };

/** Where the handle's middle is for a drawer `width` rem wide, as a fraction of the frame. */
const handleAt = (sizes: typeof wide, width: number) => (width - 0.3) / sizes.frame;

/**
 * Starred chosen, the current destination moving to it, and Inbox again; then the drawer's resize
 * handle dragged in to its least width and held there, the drawer narrowing with it and the open
 * message beside it rewrapping into the room it gives, and back out to its width, as people resize
 * it.
 */
const scriptOf = (sizes: typeof wide): PointerStep[] => [
  { wait: 300 },
  { to: item(2) },
  { wait: 400 },
  { click: true },
  { wait: 1100 },
  { to: item(1), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: frameSelector, x: handleAt(sizes, sizes.width), y: 0.5, duration: 450 },
  { wait: 300 },
  { press: true },
  { to: frameSelector, x: handleAt(sizes, sizes.narrowed), y: 0.5, duration: 900 },
  { wait: 1500 },
  { to: frameSelector, x: handleAt(sizes, sizes.width), y: 0.5, duration: 800 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
];
const scripts = { wide: scriptOf(wide), narrow: scriptOf(narrow) };

/**
 * The application's frame the drawer stands at the start of, the message open beside it: as wide
 * as the stage shows whole with even margins, and as low as the stage shows, so the drawer's
 * resize grip, at the middle of its height, stands between its rows rather than beside one of
 * them. It is the size container the drawer takes at most half of, as a Scaffold is.
 */
const frameOf = (width: number) =>
  ({ inlineSize: `${width}rem`, blockSize: '6.5rem', display: 'flex' }) as const;

/**
 * A mail application's drawer of two destinations, Inbox current, both rows whole: labels without
 * icons, resizable, and set to half its frame at rest, so it shows whole across a gallery's stage
 * at its own size with the open message whole beside it; on a phone's narrower stage, narrower
 * still.
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
    { label: 'Inbox', ...destination('inbox') },
    { label: 'Starred', ...destination('starred') },
  ];
  return (
    <Box container="mail" style={frameOf(sizes.frame)}>
      <NavigationDrawer
        aria-label="Mail"
        destinations={destinations}
        resizable
        defaultWidth={sizes.width}
        minWidth={sizes.narrowed}
      />
      <Column gap={1} padding={3} style={{ flex: 1, minInlineSize: 0 }}>
        <Text variant="title">Standup</Text>
        <Text variant="body-sm" emphasis="muted">
          Today at 10 with the team.
        </Text>
      </Column>
    </Box>
  );
}
