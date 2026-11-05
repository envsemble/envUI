import { useState } from 'react';
import {
  IconButton,
  Page,
  NavigationBar,
  Scaffold,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { usePointer, type PointerStep } from '../motion/Motion';

const item = (index: number) =>
  `.env-navigation-bar-list > li:nth-child(${index}) .env-navigation-bar-item`;

/** Inbox chosen in the bar, and Home again: the top bar's title follows, and the frame stays. */
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
 * An application's frame at its own size, as wide as a gallery's tile shows: the top bar, titled
 * with the place, over the navigation bar, the form a compact window's navigation takes, its places
 * side by side, so both show whole in the low stage.
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
      navigationForms={{ compact: 'bar', medium: 'bar', expanded: 'bar', large: 'bar' }}
      style={{ inlineSize: '12.5rem', blockSize: '7rem' }}
      topBar={
        <TopBar
          title={current}
          actions={<IconButton icon={<IconSearch />} aria-label="Search" />}
        />
      }
      navigation={{ bar: <NavigationBar destinations={destinations} /> }}
    >
      <Page />
    </Scaffold>
  );
}
