import { Avatar, Badge, Button, PageHeader } from '@envsemble/envui';

export default function InANarrowPane() {
  return (
    // Below 37.5 rem of its own width, the actions move under the title and wrap.
    <PageHeader
      title="Sam Lee"
      headingLevel={3}
      description="Product designer"
      start={<Avatar name="Sam Lee" />}
      meta={<Badge>Admin</Badge>}
      actions={
        <>
          <Button variant="secondary">Message</Button>
          <Button>Edit profile</Button>
        </>
      }
    />
  );
}
