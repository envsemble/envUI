import { Avatar, Breadcrumbs } from '@envsemble/envui';

export default function WithAvatar() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Projects', href: '/projects' },
        {
          label: 'Northwind',
          href: '/projects/northwind',
          start: <Avatar name="Northwind" size="sm" />,
        },
        { label: 'Website refresh' },
      ]}
    />
  );
}
