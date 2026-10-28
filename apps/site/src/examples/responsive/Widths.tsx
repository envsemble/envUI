import {
  Avatar,
  Badge,
  Button,
  Column,
  DescriptionList,
  PageHeader,
  Surface,
} from '@envsemble/envui';

// Each component lays itself out for the space it has: nothing to set for a narrow pane.
export default function Widths() {
  return (
    <Surface background="default" padding={5} radius="xl" render={<Column gap={5} />}>
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
      <DescriptionList.Root aria-label="Profile details">
        <DescriptionList.Item label="Team">Research</DescriptionList.Item>
        <DescriptionList.Item label="Location">Lisbon</DescriptionList.Item>
        <DescriptionList.Item label="Joined">4 March 2026</DescriptionList.Item>
      </DescriptionList.Root>
    </Surface>
  );
}
