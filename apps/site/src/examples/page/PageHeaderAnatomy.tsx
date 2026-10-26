import { Avatar, Badge, Breadcrumbs, Button, PageHeader, SearchField } from '@envsemble/envui';

export default function PageHeaderAnatomy() {
  return (
    <PageHeader
      headingLevel={3}
      breadcrumbs={
        <Breadcrumbs
          wrap={false}
          items={[{ label: 'People', href: '/people' }, { label: 'Sam Lee' }]}
        />
      }
      start={<Avatar name="Sam Lee" />}
      title="Sam Lee"
      meta={<Badge>Admin</Badge>}
      description="Product designer"
      actions={<Button>Edit profile</Button>}
      toolbar={<SearchField label="Search activity" size="sm" />}
    />
  );
}
