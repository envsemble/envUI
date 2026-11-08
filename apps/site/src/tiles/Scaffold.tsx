import { useState } from 'react';
import {
  IconButton,
  Page,
  NavigationBar,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSearch } from '@envsemble/envui/icons/Search';
import type { PointerStep } from '../motion/PointerPlan';
import { usePointer } from '../motion/PointerPlayback';

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
  { label: 'Home', icon: <IconHome />, line: 'Welcome back.' },
  { label: 'Inbox', icon: <IconInbox />, line: '2 unread.' },
];

/**
 * An application's frame filling its card (AppTile.tsx): the top bar, titled with the place, over
 * its page, and the navigation bar, the form a compact window's navigation takes, its places side
 * by side at the foot.
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
      topBar={
        <TopBar
          title={current}
          actions={<IconButton icon={<IconSearch />} aria-label="Search" />}
        />
      }
      navigation={{ bar: <NavigationBar destinations={destinations} /> }}
    >
      <Page>
        <Text emphasis="muted">{places.find((place) => place.label === current)?.line}</Text>
      </Page>
    </Scaffold>
  );
}
