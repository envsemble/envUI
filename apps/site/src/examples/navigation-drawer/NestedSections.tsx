import { useState } from 'react';
import { NavigationDrawer, type NavigationDrawerDestination } from '@envsemble/envui';

interface Page {
  label: string;
  href?: string;
  group?: string;
  children?: Page[];
}

const guide: Page[] = [
  { label: 'Overview', href: '/guide', group: 'Getting started' },
  {
    label: 'Projects',
    href: '/guide/projects',
    group: 'Using Northwind',
    children: [
      { label: 'Create a project', href: '/guide/projects/create' },
      {
        label: 'Sharing',
        children: [
          { label: 'Invite your team', href: '/guide/projects/invite' },
          { label: 'Roles and access', href: '/guide/projects/roles' },
        ],
      },
      { label: 'Archive a project', href: '/guide/projects/archive' },
    ],
  },
  {
    label: 'Reports',
    href: '/guide/reports',
    group: 'Using Northwind',
    children: [
      { label: 'Quarterly report', href: '/guide/reports/quarterly' },
      { label: 'Export', href: '/guide/reports/export' },
    ],
  },
  {
    label: 'Billing',
    group: 'Account',
    children: [
      { label: 'Plans', href: '/guide/billing/plans' },
      { label: 'Invoices', href: '/guide/billing/invoices' },
    ],
  },
];

export default function NestedSections() {
  const [current, setCurrent] = useState('/guide/projects/roles');
  const destinationsOf = (pages: Page[]): NavigationDrawerDestination[] =>
    pages.map(({ href, children, ...page }) => {
      const nested = children && destinationsOf(children);
      const isOnlyAHeading = href === undefined;
      if (isOnlyAHeading) return { ...page, children: nested ?? [] };
      return {
        ...page,
        href,
        children: nested,
        current: current === href,
        onClick: () => setCurrent(href),
      };
    });
  return <NavigationDrawer aria-label="Guide" destinations={destinationsOf(guide)} />;
}
