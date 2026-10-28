import { useState } from 'react';
import {
  IconButton,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Search } from '@envsemble/envui/icons/Search';
import { usePointer, type PointerStep } from '../motion/Motion';

const item = (index: number) => `.env-rail-list > li:nth-child(${index}) .env-rail-item`;

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
  { label: 'Home', icon: <Home />, line: 'Welcome back.' },
  { label: 'Inbox', icon: <Inbox />, line: '3 new messages.' },
];

/** An application's frame: the rail at the start, the top bar and the page beside it. */
export default function ScaffoldTile() {
  const [current, setCurrent] = useState('Home');
  usePointer(script);
  const destinations: Destination[] = places.map(({ label, icon }) => ({
    label,
    icon,
    current: label === current,
    onSelect: () => setCurrent(label),
  }));
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      forms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
      style={{ inlineSize: '16rem', blockSize: '10.5rem' }}
      topBar={
        <TopBar title="Northwind" actions={<IconButton icon={<Search />} aria-label="Search" />} />
      }
      navigation={{ rail: <Rail destinations={destinations} /> }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">{places.find((place) => place.label === current)?.line}</Text>
      </Page>
    </Scaffold>
  );
}
