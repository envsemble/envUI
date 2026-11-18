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
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const item = (index: number) =>
  `.env-navigation-bar-list > li:nth-child(${index}) .env-navigation-bar-item`;

const script: PointerStep[] = [
  { wait: 240 },
  { to: item(2) },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: item(1), duration: 400 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 300 },
];

const places = [
  { label: 'Home', icon: <IconHome />, line: 'Welcome back.' },
  { label: 'Inbox', icon: <IconInbox />, line: '2 unread.' },
];

export const tileWindow: TileWindow = { app: {} };

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
        <TopBar title={current} end={<IconButton icon={<IconSearch />} aria-label="Search" />} />
      }
      navigation={{ bar: <NavigationBar destinations={destinations} /> }}
    >
      <Page>
        <Text emphasis="muted">{places.find((place) => place.label === current)?.line}</Text>
      </Page>
    </Scaffold>
  );
}
