import { useState } from 'react';
import {
  IconButton,
  Page,
  PageHeader,
  NavigationRail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { usePointer, type PointerStep } from '../motion/Motion';

const item = (index: number) =>
  `.env-navigation-rail-list > li:nth-child(${index}) .env-navigation-rail-item`;

/** Inbox chosen in the rail, and Home again: the body follows, and the frame stays. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: item(2) },
  { wait: 500 },
  { click: true },
  { wait: 1500 },
  { to: item(1), duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 500 },
];

const places = [
  { label: 'Home', icon: <IconHome />, line: 'Welcome back.' },
  { label: 'Inbox', icon: <IconInbox />, line: '3 new messages.' },
];

/**
 * An application's frame is taller than a gallery's low tile at its own size, its rail's places
 * one under the other: it is drawn at four fifths of it, as a pattern's scene is, so both places
 * and the page beside them show whole.
 */
const smaller = { transform: 'scale(0.8)', transformOrigin: '0 0' } as const;

/** An application's frame: the rail at the start, the top bar and the page beside it. */
export default function ScaffoldTile() {
  const [current, setCurrent] = useState('Home');
  usePointer(script);
  const destinations: Destination[] = places.map(({ label, icon }) => ({
    label,
    icon,
    current: label === current,
    onClick: () => setCurrent(label),
  }));
  return (
    <div style={smaller}>
      <Scaffold
        scroll="body"
        landmarks={false}
        navigationForms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
        style={{ inlineSize: '15rem', blockSize: '8.75rem' }}
        topBar={
          <TopBar
            title="Northwind"
            actions={<IconButton icon={<IconSearch />} aria-label="Search" />}
          />
        }
        navigation={{ rail: <NavigationRail destinations={destinations} /> }}
      >
        <Page header={<PageHeader title={current} headingLevel={3} />}>
          <Text emphasis="muted">{places.find((place) => place.label === current)?.line}</Text>
        </Page>
      </Scaffold>
    </div>
  );
}
