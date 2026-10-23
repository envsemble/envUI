import { Bar, type Destination } from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/home', current: true },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox' },
  { label: 'Projects', icon: <Folder />, href: '/projects' },
  { label: 'Settings', icon: <Settings />, href: '/settings' },
];

export default function ShortLabels() {
  return (
    // As wide as a phone.
    <div style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Bar aria-label="Main, short labels" destinations={destinations} />
    </div>
  );
}
