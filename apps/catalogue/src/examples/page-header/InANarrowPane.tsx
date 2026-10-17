import { Avatar, Badge, Button, PageHeader, Surface } from '@envsemble/envui';

export default function InANarrowPane() {
  return (
    // As narrow as a side panel: below 32 rem the actions move under the title and wrap.
    <Surface background="muted" padding={4} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <PageHeader
        title="Sam Lee"
        headingLevel={2}
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
    </Surface>
  );
}
