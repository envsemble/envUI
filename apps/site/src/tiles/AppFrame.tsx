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
import { IconCategory } from '@envsemble/envui/icons/Category';
import { IconGroup } from '@envsemble/envui/icons/Group';
import { IconHome } from '@envsemble/envui/icons/Home';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const item = (index: number) =>
  `.env-navigation-rail-list > li:nth-child(${index}) .env-navigation-rail-item`;

/** Chooses Projects, then Team, the page changing with each, then Home again; the frame stays. */
const script: PointerStep[] = [
  { wait: 240 },
  { to: item(2) },
  { wait: 240 },
  { click: true },
  { wait: 720 },
  { to: item(3), duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 720 },
  { to: item(1), duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 240 },
];

const places = [
  { label: 'Home', icon: <IconHome />, line: 'Welcome back.' },
  { label: 'Projects', icon: <IconCategory />, line: '4 active.' },
  { label: 'Team', icon: <IconGroup />, line: '6 people.' },
];

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 18, height: 13.5 };

/**
 * An application's frame: the top bar, the rail of its places, and the page of the current place.
 */
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
      style={{ inlineSize: '17rem', blockSize: '12.5rem' }}
      topBar={<TopBar title="Northwind" actions={<AvatarButton name="Alex Morgan" />} />}
      navigation={{ rail: <NavigationRail destinations={destinations} /> }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">{places.find((place) => place.label === current)?.line}</Text>
      </Page>
    </Scaffold>
  );
}
