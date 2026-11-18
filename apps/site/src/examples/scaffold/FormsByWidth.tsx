import { useState } from 'react';
import {
  NavigationBar,
  NavigationDrawer,
  Page,
  PageHeader,
  NavigationRail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconCategory } from '@envsemble/envui/icons/Category';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';

export default function FormsByWidth() {
  const [current, setCurrent] = useState('Inbox');
  const destinations: Destination[] = [
    { label: 'Home', icon: <IconHome /> },
    { label: 'Inbox', icon: <IconInbox />, count: 3 },
    { label: 'Projects', icon: <IconCategory /> },
  ].map((destination) => ({
    ...destination,
    current: destination.label === current,
    onClick: () => setCurrent(destination.label),
  }));
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '20rem' }}
      topBar={<TopBar title="Northwind" />}
      navigation={{
        bar: <NavigationBar aria-label="Main, by width" destinations={destinations} />,
        rail: <NavigationRail aria-label="Main, by width" destinations={destinations} />,
        drawer: <NavigationDrawer aria-label="Main, by width" destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">Three messages since yesterday.</Text>
      </Page>
    </Scaffold>
  );
}
