import { Drawer, type DrawerDestination } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';

// Icons on some destinations only: the labels no longer line up.
const destinations: DrawerDestination[] = [
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', current: true },
  { label: 'Starred', href: '/starred' },
  { label: 'Archive', href: '/archive' },
];

export default function IconsForSome() {
  return <Drawer aria-label="Main, icons for some" destinations={destinations} />;
}
