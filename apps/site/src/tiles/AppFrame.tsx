import { useState } from 'react';
import {
  AvatarButton,
  Page,
  PageHeader,
  NavigationRail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { usePointer, type PointerStep } from '../motion/Motion';

const item = (index: number) =>
  `.env-navigation-rail-list > li:nth-child(${index}) .env-navigation-rail-item`;

/** Projects chosen, then Team, the page following each, and Home again: the frame stays. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: item(2) },
  { wait: 400 },
  { click: true },
  { wait: 1200 },
  { to: item(3), duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 1200 },
  { to: item(1), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

const places = [
  { label: 'Home', icon: <Home />, line: 'Welcome back.' },
  { label: 'Projects', icon: <Category />, line: '4 active.' },
  { label: 'Team', icon: <Group />, line: '6 people.' },
];

/** An application's frame: the top bar, the rail of its places, and the page of the current one. */
export default function AppFrameTile() {
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
      style={{ inlineSize: '16rem', blockSize: '13.5rem' }}
      topBar={<TopBar title="Northwind" actions={<AvatarButton name="Alex Morgan" />} />}
      navigation={{ rail: <NavigationRail destinations={destinations} /> }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">{places.find((place) => place.label === current)?.line}</Text>
      </Page>
    </Scaffold>
  );
}
