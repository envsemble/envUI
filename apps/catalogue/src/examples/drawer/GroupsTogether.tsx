import { Drawer, type DrawerDestination } from '@envsemble/envui';

const destinations: DrawerDestination[] = [
  { label: 'Overview', href: '/guide/overview', group: 'Getting started', current: true },
  { label: 'Install the app', href: '/guide/install', group: 'Getting started' },
  { label: 'Profile', href: '/account/profile', group: 'Account' },
  { label: 'Billing', href: '/account/billing', group: 'Account' },
];

export default function GroupsTogether() {
  return <Drawer aria-label="Help" destinations={destinations} />;
}
