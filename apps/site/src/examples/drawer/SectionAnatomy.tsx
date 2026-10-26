import { Drawer, type DrawerDestination } from '@envsemble/envui';

const destinations: DrawerDestination[] = [
  {
    label: 'Projects',
    href: '/guide/projects',
    children: [
      { label: 'Create a project', href: '/guide/projects/create', current: true },
      { label: 'Archive a project', href: '/guide/projects/archive' },
    ],
  },
  {
    label: 'Billing',
    children: [{ label: 'Invoices', href: '/guide/billing/invoices' }],
  },
];

export default function SectionAnatomy() {
  return <Drawer aria-label="Help" destinations={destinations} />;
}
