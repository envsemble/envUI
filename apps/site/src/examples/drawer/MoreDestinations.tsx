import { useState } from 'react';
import { Bar, type Destination } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { CalendarMonth } from '@envsemble/envui/icons/CalendarMonth';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function MoreDestinations() {
  // The current page comes from the router; here a press stands in for it.
  const [current, setCurrent] = useState('Inbox');
  // Seven destinations: the bar shows the first four and opens the other three from More.
  const destinations: Destination[] = [
    { label: 'Home', icon: <Home /> },
    { label: 'Inbox', icon: <Inbox />, count: 4 },
    { label: 'Projects', icon: <Folder /> },
    { label: 'Calendar', icon: <CalendarMonth /> },
    { label: 'People', icon: <Group />, count: 2 },
    { label: 'Archive', icon: <Archive /> },
    { label: 'Settings', icon: <Settings /> },
  ].map((destination) => ({
    ...destination,
    current: destination.label === current,
    onClick: () => setCurrent(destination.label),
  }));
  return (
    // As wide as a phone.
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Bar aria-label="Main, seven destinations" destinations={destinations} />
    </div>
  );
}
