import { useEffect, useMemo, useState } from 'react';
import { NavigationDrawer, type NavigationDrawerDestination } from '@envsemble/envui';

const pages = [
  { href: '/guide/overview', label: 'Overview', group: 'Getting started' },
  { href: '/guide/install', label: 'Install the app on your devices', group: 'Getting started' },
  { href: '/guide/invite', label: 'Invite your team', group: 'Getting started' },
  { href: '/account/profile', label: 'Profile', group: 'Account' },
  { href: '/account/billing', label: 'Billing and invoices', group: 'Account' },
];

const storageKey = 'guide-drawer-width';

function storedWidth() {
  try {
    const stored = Number(localStorage.getItem(storageKey) ?? Number.NaN);
    return Number.isFinite(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

function storeWidth(width: number) {
  try {
    localStorage.setItem(storageKey, String(width));
    return true;
  } catch {
    return false;
  }
}

export default function ResizableDrawer() {
  const [current, setCurrent] = useState('/guide/install');
  const [width, setWidth] = useState(17.5);
  useEffect(() => {
    const stored = storedWidth();
    if (stored !== undefined) setWidth(stored);
  }, []);
  const destinations = useMemo<NavigationDrawerDestination[]>(
    () =>
      pages.map((page) => ({
        ...page,
        current: current === page.href,
        onClick: () => setCurrent(page.href),
      })),
    [current],
  );
  return (
    <NavigationDrawer
      aria-label="Guide"
      destinations={destinations}
      resizable
      width={width}
      minWidth={15}
      maxWidth={24}
      onWidthChange={(next, { committed }) => {
        setWidth(next);
        if (committed) storeWidth(next);
      }}
    />
  );
}
