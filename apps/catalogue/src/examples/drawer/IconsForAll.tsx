import { Drawer, type DrawerDestination } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Star } from '@envsemble/envui/icons/Star';

const destinations: DrawerDestination[] = [
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', current: true },
  { label: 'Starred', icon: <Star />, href: '/starred' },
  { label: 'Archive', icon: <Archive />, href: '/archive' },
];

export default function IconsForAll() {
  return <Drawer aria-label="Main, icons for all" destinations={destinations} />;
}
