import { useState } from 'react';
import {
  IconButton,
  Page,
  PageHeader,
  NavigationRail,
  Scaffold,
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
  { label: 'Home', icon: <IconHome /> },
  { label: 'Inbox', icon: <IconInbox /> },
];

/**
 * An application's frame at its own size, as wide as a gallery's tile shows: the rail at the
 * start, the top bar and the page's header beside it.
 */
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
    <Scaffold
      scroll="body"
      landmarks={false}
      navigationForms={{ compact: 'rail', medium: 'rail', expanded: 'rail', large: 'rail' }}
      style={{ inlineSize: '12.5rem', blockSize: '7.125rem' }}
      topBar={
        <TopBar title="Acme" actions={<IconButton icon={<IconSearch />} aria-label="Search" />} />
      }
      navigation={{ rail: <NavigationRail destinations={destinations} /> }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />} />
    </Scaffold>
  );
}
