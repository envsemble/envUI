import { useState } from 'react';
import { NavList } from '@envsemble/envui';

const groups = [
  {
    label: 'Getting started',
    pages: [
      { href: '/guide/overview', title: 'Overview' },
      { href: '/guide/install', title: 'Install the app' },
      { href: '/guide/invite', title: 'Invite your team' },
    ],
  },
  {
    label: 'Account',
    pages: [
      { href: '/account/profile', title: 'Profile' },
      { href: '/account/billing', title: 'Billing and invoices' },
    ],
  },
];

export default function GroupedDestinations() {
  const [current, setCurrent] = useState('/guide/install');
  return (
    <nav aria-label="Help">
      <NavList.Root>
        {groups.map((group) => (
          <NavList.Group key={group.label} label={group.label}>
            {group.pages.map((page) => (
              <NavList.Item
                key={page.href}
                href={page.href}
                selected={current === page.href}
                onClick={() => setCurrent(page.href)}
              >
                {page.title}
              </NavList.Item>
            ))}
          </NavList.Group>
        ))}
      </NavList.Root>
    </nav>
  );
}
