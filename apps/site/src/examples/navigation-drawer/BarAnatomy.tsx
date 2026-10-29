import { NavigationBar, type Destination } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';

const destinations: Destination[] = [
  { label: 'Inbox', icon: <IconInbox />, href: '/inbox', count: 4, current: true },
  { label: 'Home', icon: <IconHome />, href: '/home' },
  { label: 'Projects', icon: <IconFolder />, href: '/projects' },
];

export default function BarAnatomy() {
  return (
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
      <NavigationBar destinations={destinations} />
    </div>
  );
}
