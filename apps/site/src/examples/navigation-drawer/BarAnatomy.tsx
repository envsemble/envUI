import { NavigationBar, type Destination } from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';

const destinations: Destination[] = [
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: 4, current: true },
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Projects', icon: <Folder />, href: '/projects' },
];

export default function BarAnatomy() {
  return (
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
      <NavigationBar destinations={destinations} />
    </div>
  );
}
