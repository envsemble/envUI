import { Avatar, Badge, Button, Page, PageHeader, Surface, Text } from '@envsemble/envui';

export default function Gutters() {
  return (
    // The gutter follows the window class of the region the page sits in: 1 rem in a compact one,
    // 1.5 rem from medium. Below 37.5 rem of its own width, the header's actions move under the
    // title and wrap.
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
