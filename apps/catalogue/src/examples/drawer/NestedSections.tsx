import { useState } from 'react';
import { Drawer, type DrawerDestination } from '@envsemble/envui';

/** A guide's pages: a page with pages under it is a section, and one without href only heads it. */
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
  // The current page comes from the router; here a press stands in for it.
  const [current, setCurrent] = useState('/guide/projects/roles');
  const destinationsOf = (pages: Page[]): DrawerDestination[] =>
    pages.map(({ href, children, ...page }) => {
      const nested = children && destinationsOf(children);
      // A section without an address of its own is only its heading.
      if (href === undefined) return { ...page, children: nested ?? [] };
      return {
        ...page,
        href,
        children: nested,
        current: current === href,
        onSelect: () => setCurrent(href),
      };
    });
  // The sections that hold the current page start open; the others open with their chevrons.
  return <Drawer aria-label="Guide" destinations={destinationsOf(guide)} />;
}
