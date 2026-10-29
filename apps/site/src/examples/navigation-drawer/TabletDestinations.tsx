import { useState } from 'react';
import { IconButton, NavigationRail, type Destination } from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function TabletDestinations() {
  // The router knows the current page; here a press stands in for it.
  const [current, setCurrent] = useState('/inbox');
  const destination = (href: string) => ({
    href,
    current: current === href,
    onClick: () => setCurrent(href),
  });
  const destinations: Destination[] = [
    { label: 'Home', icon: <Home />, ...destination('/home') },
    { label: 'Inbox', icon: <Inbox />, count: 4, ...destination('/inbox') },
    { label: 'Projects', icon: <Folder />, ...destination('/projects') },
    { label: 'Settings', icon: <Settings />, ...destination('/settings') },
  ];
  return (
    // As tall as a short window; in an app, Scaffold gives the rail the window's height.
    <div style={{ blockSize: '24rem' }}>
      <NavigationRail
        destinations={destinations}
        header={<IconButton variant="primary" icon={<Edit />} aria-label="New message" />}
      />
    </div>
  );
}
