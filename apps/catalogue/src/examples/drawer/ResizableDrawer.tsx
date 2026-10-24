import { useState } from 'react';
import { Drawer, type DrawerDestination } from '@envsemble/envui';

const pages = [
  { href: '/guide/overview', label: 'Overview', group: 'Getting started' },
  { href: '/guide/install', label: 'Install the app', group: 'Getting started' },
  { href: '/guide/invite', label: 'Invite your team', group: 'Getting started' },
  { href: '/account/profile', label: 'Profile', group: 'Account' },
  { href: '/account/billing', label: 'Billing and invoices', group: 'Account' },
];

const storageKey = 'help-drawer-width';

/** The width people chose on an earlier visit, if any. */
function storedWidth() {
  const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(storageKey);
  return stored === null ? 17.5 : Number(stored);
}

export default function ResizableDrawer() {
  const [current, setCurrent] = useState('/guide/install');
  // The application keeps the width people choose, for their next visit.
  const [width, setWidth] = useState(storedWidth);
  const destinations: DrawerDestination[] = pages.map((page) => ({
    ...page,
    current: current === page.href,
    onSelect: () => setCurrent(page.href),
  }));
  return (
    <Drawer
      aria-label="Help"
      destinations={destinations}
      resizable
      width={width}
      minWidth={15}
      maxWidth={24}
      onWidthChange={(next, { committed }) => {
        setWidth(next);
        if (committed) localStorage.setItem(storageKey, String(next));
      }}
    />
  );
}
