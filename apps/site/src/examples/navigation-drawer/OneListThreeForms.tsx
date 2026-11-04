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
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export default function OneListThreeForms() {
  const [current, setCurrent] = useState('Inbox');
  // One array, passed to each form; Scaffold shows the one that suits its width.
  const destinations: Destination[] = [
    { label: 'Home', icon: <IconHome /> },
    { label: 'Inbox', icon: <IconInbox />, count: 4 },
    { label: 'Projects', icon: <IconFolder />, group: 'Work' },
    { label: 'Settings', icon: <IconSettings />, group: 'Account' },
  ].map((destination) => ({
    ...destination,
    current: destination.label === current,
    onClick: () => setCurrent(destination.label),
  }));
  return (
    // A preview: the body scrolls in a frame 22 rem tall, instead of the window.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={{ blockSize: '22rem' }}
      topBar={<TopBar title="Northwind" />}
      navigation={{
        drawer: <NavigationDrawer aria-label="Main" destinations={destinations} />,
        rail: <NavigationRail aria-label="Main" destinations={destinations} />,
        bar: <NavigationBar aria-label="Main" destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">Four messages since yesterday.</Text>
      </Page>
    </Scaffold>
  );
}
