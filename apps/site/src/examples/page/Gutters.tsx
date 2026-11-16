import { Avatar, Badge, Button, Page, PageHeader, Text } from '@envsemble/envui';

export default function Gutters() {
  return (
    <Page
      width="md"
      header={
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
      }
    >
      <Text>Leads the design of the mobile apps.</Text>
    </Page>
  );
}
