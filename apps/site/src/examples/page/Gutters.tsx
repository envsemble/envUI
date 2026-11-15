import { Avatar, Badge, Button, Page, PageHeader, Surface, Text } from '@envsemble/envui';

export default function Gutters() {
  return (
    <Surface background="muted" padding={0}>
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
        <Surface background="default" padding={4}>
          <Text>Leads the design of the mobile apps.</Text>
        </Surface>
      </Page>
    </Surface>
  );
}
