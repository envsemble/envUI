import { useState } from 'react';
import { IconButton, NavigationRail, type Destination } from '@envsemble/envui';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export default function TabletDestinations() {
  const [current, setCurrent] = useState('/inbox');
  const destination = (href: string) => ({
    href,
    current: current === href,
    onClick: () => setCurrent(href),
  });
  const destinations: Destination[] = [
    { label: 'Home', icon: <IconHome />, ...destination('/home') },
    { label: 'Inbox', icon: <IconInbox />, count: 4, ...destination('/inbox') },
    { label: 'Projects', icon: <IconFolder />, ...destination('/projects') },
    { label: 'Settings', icon: <IconSettings />, ...destination('/settings') },
  ];
  return (
    <div style={{ blockSize: '24rem' }}>
      <NavigationRail
        destinations={destinations}
        header={<IconButton variant="primary" icon={<IconEdit />} aria-label="New message" />}
      />
    </div>
  );
}
