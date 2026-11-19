import { Avatar, Breadcrumbs } from '@envsemble/envui';

export default function WithAvatar() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Projects', href: '/projects' },
        {
          label: (
            <>
              <Avatar name="Northwind" size="sm" /> Northwind
            </>
          ),
          href: '/projects/northwind',
        },
        { label: 'Website refresh' },
      ]}
    />
  );
}
