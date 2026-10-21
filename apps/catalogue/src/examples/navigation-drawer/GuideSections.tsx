import { useState } from 'react';
import { NavigationDrawer, type DrawerDestination } from '@envsemble/envui';

const pages = [
  { href: '/guide/overview', label: 'Overview', group: 'Getting started' },
  { href: '/guide/install', label: 'Install the app', group: 'Getting started' },
  { href: '/guide/invite', label: 'Invite your team', group: 'Getting started' },
  { href: '/account/profile', label: 'Profile', group: 'Account' },
  { href: '/account/billing', label: 'Billing and invoices', group: 'Account' },
];

export default function GuideSections() {
  const [current, setCurrent] = useState('/guide/install');
  // Without icons, the drawer suits the sections of a guide; Rail and Bar need icons.
  const destinations: DrawerDestination[] = pages.map((page) => ({
    ...page,
    current: current === page.href,
    onSelect: () => setCurrent(page.href),
  }));
  return <NavigationDrawer aria-label="Help" destinations={destinations} />;
}
