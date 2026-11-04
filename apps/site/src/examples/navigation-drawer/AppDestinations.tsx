import { useState } from 'react';
import { NavigationDrawer, Text, type Destination } from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconGroup } from '@envsemble/envui/icons/Group';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconLabel } from '@envsemble/envui/icons/Label';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconStar } from '@envsemble/envui/icons/Star';

export default function AppDestinations() {
  // The router knows the current page; here a press stands in for it.
  const [current, setCurrent] = useState('/inbox');
  const destination = (href: string) => ({
    href,
    current: current === href,
    onClick: () => setCurrent(href),
  });
  const destinations: Destination[] = [
    { label: 'Home', icon: <IconHome />, ...destination('/home') },
    { label: 'Inbox', icon: <IconInbox />, count: 12, ...destination('/inbox') },
    { label: 'Starred', icon: <IconStar />, group: 'Folders', ...destination('/starred') },
    { label: 'Labels', icon: <IconLabel />, group: 'Folders', count: 3, ...destination('/labels') },
    { label: 'Archive', icon: <IconArchive />, group: 'Folders', ...destination('/archive') },
    { label: 'Members', icon: <IconGroup />, group: 'Workspace', ...destination('/members') },
    { label: 'Settings', icon: <IconSettings />, group: 'Workspace', ...destination('/settings') },
  ];
  return (
    <NavigationDrawer
      destinations={destinations}
      header={
        <Text variant="title" render={<span />}>
          Mail
        </Text>
      }
    />
  );
}
