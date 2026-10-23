import { Drawer, type DrawerDestination } from '@envsemble/envui';

// A heading starts wherever the group changes, so a group split up shows its heading twice.
const destinations: DrawerDestination[] = [
  { label: 'Overview', href: '/guide/overview', group: 'Getting started', current: true },
  { label: 'Profile', href: '/account/profile', group: 'Account' },
  { label: 'Install the app', href: '/guide/install', group: 'Getting started' },
  { label: 'Billing', href: '/account/billing', group: 'Account' },
];

export default function GroupsApart() {
  return <Drawer aria-label="Help, groups apart" destinations={destinations} />;
}
