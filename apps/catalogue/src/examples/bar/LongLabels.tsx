import { Bar, type Destination } from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/home', current: true },
  { label: 'Messages and mentions', icon: <Inbox />, href: '/inbox' },
  { label: 'Shared projects', icon: <Folder />, href: '/projects' },
  { label: 'Workspace settings', icon: <Settings />, href: '/settings' },
];

export default function LongLabels() {
  return (
    // As wide as a phone.
    <div style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Bar aria-label="Main, long labels" destinations={destinations} />
    </div>
  );
}
