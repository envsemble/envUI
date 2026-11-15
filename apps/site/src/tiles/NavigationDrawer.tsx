import { useState } from 'react';
import {
  Box,
  Column,
  NavigationDrawer,
  Text,
  type NavigationDrawerDestination,
} from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import type { TileWindow } from './Tiles';

const item = (index: number) =>
  `.env-navigation-drawer-list > li:nth-child(${index}) > .env-navigation-drawer-item`;

const frameSelector = '[data-env-container]';

const wide = { frame: 12.5, width: 6.25, narrowed: 4.75 };
const narrow = { frame: 10.75, width: 5.375, narrowed: 4.5 };

const handleMiddleInsetRem = 0.3;

const handleAt = (sizes: typeof wide, width: number) =>
  (width - handleMiddleInsetRem) / sizes.frame;

const scriptOf = (sizes: typeof wide): PointerStep[] => [
  { wait: 180 },
  { to: item(2) },
  { wait: 240 },
  { click: true },
  { wait: 660 },
  { to: item(1), duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { to: frameSelector, x: handleAt(sizes, sizes.width), y: 0.5, duration: 450 },
  { wait: 180 },
  { press: true },
  { to: frameSelector, x: handleAt(sizes, sizes.narrowed), y: 0.5, duration: 900 },
  { wait: 900 },
  { to: frameSelector, x: handleAt(sizes, sizes.width), y: 0.5, duration: 800 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 240 },
];
const scripts = { wide: scriptOf(wide), narrow: scriptOf(narrow) };

const frameOf = (width: number) =>
  ({ inlineSize: `${width}rem`, blockSize: '6.5rem', display: 'flex' }) as const;

export const tileWindow: TileWindow = { width: 17, height: 12.75 };

export default function DrawerTile() {
  const [current, setCurrent] = useState('inbox');
  const sizes = useMedia(narrowGallery) ? narrow : wide;
  usePointer(sizes === narrow ? scripts.narrow : scripts.wide);
  const destination = (id: string) => ({
    current: current === id,
    onClick: () => setCurrent(id),
  });
  const destinations: NavigationDrawerDestination[] = [
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
