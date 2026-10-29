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

/**
 * The width people chose on an earlier visit, if any. Storage is the browser's, and can be missing,
 * blocked or hold a value that isn't a number, so the drawer then keeps its default.
 */
function storedWidth() {
  try {
    const stored = Number(localStorage.getItem(storageKey) ?? Number.NaN);
    return Number.isFinite(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

export default function ResizableDrawer() {
  const [current, setCurrent] = useState('/guide/install');
  // The application keeps the width people choose, for their next visit. It reads it once the
  // drawer is in the browser, so a page rendered on a server starts at the default as well.
  const [width, setWidth] = useState(17.5);
  useEffect(() => {
    const stored = storedWidth();
    if (stored !== undefined) setWidth(stored);
  }, []);
  // The same array while the width changes, so a drag renders the drawer, not each destination.
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
        if (!committed) return;
        try {
          localStorage.setItem(storageKey, String(next));
        } catch {
          // Storage is blocked or full: the width lasts until the page closes.
        }
      }}
    />
  );
}
