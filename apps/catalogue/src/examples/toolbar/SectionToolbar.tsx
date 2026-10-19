import { Badge, Button, Stack, Text } from '@envsemble/envui';

export default function SectionToolbar() {
  return (
    // A section's heading and count at the start, its actions at the end; the row wraps when
    // there isn't room.
    <Stack direction="row" wrap align="center" justify="between" gap={3}>
      <Stack direction="row" align="center" gap={2}>
        <Text variant="title" render={<h2 />}>
          Members
        </Text>
        <Badge>12</Badge>
      </Stack>
      <Stack direction="row" wrap gap={2}>
        <Button variant="secondary" size="sm">
          Export
        </Button>
        <Button size="sm">Invite</Button>
      </Stack>
    </Stack>
  );
}
