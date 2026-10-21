import { Badge, Button, Row, Text } from '@envsemble/envui';

export default function SectionToolbar() {
  return (
    // A section's heading and count at the start, its actions at the end; the row wraps when
    // there isn't room.
    <Row wrap align="center" justify="between" gap={3}>
      <Row align="center" gap={2}>
        <Text variant="title" render={<h2 />}>
          Members
        </Text>
        <Badge>12</Badge>
      </Row>
      <Row wrap gap={2}>
        <Button variant="secondary" size="sm">
          Export
        </Button>
        <Button size="sm">Invite</Button>
      </Row>
    </Row>
  );
}
