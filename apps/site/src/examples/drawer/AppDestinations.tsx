import { useState } from 'react';
import { Drawer, Text, type Destination } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Label } from '@envsemble/envui/icons/Label';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Star } from '@envsemble/envui/icons/Star';

export default function AppDestinations() {
  // The router knows the current page; here a press stands in for it.
  const [current, setCurrent] = useState('/inbox');
  const destination = (href: string) => ({
    href,
    current: current === href,
    onClick: () => setCurrent(href),
  });
  const destinations: Destination[] = [
    { label: 'Home', icon: <Home />, ...destination('/home') },
    { label: 'Inbox', icon: <Inbox />, count: 12, ...destination('/inbox') },
    { label: 'Starred', icon: <Star />, group: 'Folders', ...destination('/starred') },
    { label: 'Labels', icon: <Label />, group: 'Folders', count: 3, ...destination('/labels') },
    { label: 'Archive', icon: <Archive />, group: 'Folders', ...destination('/archive') },
    { label: 'Members', icon: <Group />, group: 'Workspace', ...destination('/members') },
    { label: 'Settings', icon: <Settings />, group: 'Workspace', ...destination('/settings') },
  ];
  return (
    <Drawer
      destinations={destinations}
      header={
        <Text variant="title" render={<span />}>
          Mail
        </Text>
      }
    />
  );
}
