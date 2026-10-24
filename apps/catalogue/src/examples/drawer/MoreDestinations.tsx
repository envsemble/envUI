import { Bar, type Destination } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { CalendarMonth } from '@envsemble/envui/icons/CalendarMonth';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';

// Seven destinations: the bar shows the first four and opens the other three from More.
const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: 4 },
  { label: 'Projects', icon: <Folder />, href: '/projects' },
  { label: 'Calendar', icon: <CalendarMonth />, href: '/calendar' },
  { label: 'People', icon: <Group />, href: '/people', count: 2 },
  { label: 'Archive', icon: <Archive />, href: '/archive', current: true },
  { label: 'Settings', icon: <Settings />, href: '/settings' },
];

export default function MoreDestinations() {
  return (
    // As wide as a phone.
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Bar aria-label="Main, seven destinations" destinations={destinations} />
    </div>
  );
}
