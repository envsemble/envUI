import { useState } from 'react';
import {
  Bar,
  Drawer,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';

export default function FormsByWidth() {
  const [current, setCurrent] = useState('Inbox');
  // One array of destinations, which each navigation form takes.
  const destinations: Destination[] = [
    { label: 'Home', icon: <Home /> },
    { label: 'Inbox', icon: <Inbox />, count: 3 },
    { label: 'Projects', icon: <Category /> },
  ].map((destination) => ({
    ...destination,
    current: destination.label === current,
    onSelect: () => setCurrent(destination.label),
  }));
  return (
    // A preview: the body scrolls in a frame 20 rem tall, instead of the window.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '20rem' }}
      topBar={<TopBar title="Northwind" />}
      navigation={{
        bar: <Bar aria-label="Main, by width" destinations={destinations} />,
        rail: <Rail aria-label="Main, by width" destinations={destinations} />,
        drawer: <Drawer aria-label="Main, by width" destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">Three messages since yesterday.</Text>
      </Page>
    </Scaffold>
  );
}
