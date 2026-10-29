import { NavigationBar, type Destination } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSettings } from '@envsemble/envui/icons/Settings';

const destinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '/home', current: true },
  { label: 'Inbox', icon: <IconInbox />, href: '/inbox', count: 4 },
  { label: 'Projects', icon: <IconFolder />, href: '/projects' },
  { label: 'Settings', icon: <IconSettings />, href: '/settings' },
];

export default function SharedWidth() {
  return <NavigationBar aria-label="Main, shared width" destinations={destinations} />;
}
