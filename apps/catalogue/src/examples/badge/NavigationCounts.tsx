import { NavigationDrawer, type Destination } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Schedule } from '@envsemble/envui/icons/Schedule';

// The drawer shows each count at the end of its destination and says it in the name: Inbox, 12 new.
const destinations: Destination[] = [
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: 12, current: true },
  { label: 'Plans', icon: <Description />, href: '/plans', count: 4 },
  { label: 'Later', icon: <Schedule />, href: '/later', count: 1200 },
];

export default function NavigationCounts() {
  return <NavigationDrawer aria-label="Workspace" destinations={destinations} />;
}
