import { useState } from 'react';
import { NavigationBar, type Destination } from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconCalendarMonth } from '@envsemble/envui/icons/CalendarMonth';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconGroup } from '@envsemble/envui/icons/Group';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export default function MoreDestinations() {
  const [current, setCurrent] = useState('Inbox');
  const destinations: Destination[] = [
    { label: 'Home', icon: <IconHome /> },
    { label: 'Inbox', icon: <IconInbox />, count: 4 },
    { label: 'Projects', icon: <IconFolder /> },
    { label: 'Calendar', icon: <IconCalendarMonth /> },
    { label: 'People', icon: <IconGroup />, count: 2 },
    { label: 'Archive', icon: <IconArchive /> },
    { label: 'Settings', icon: <IconSettings /> },
  ].map((destination) => ({
    ...destination,
    current: destination.label === current,
    onClick: () => setCurrent(destination.label),
  }));
  return (
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <NavigationBar aria-label="Main, seven destinations" destinations={destinations} />
    </div>
  );
}
