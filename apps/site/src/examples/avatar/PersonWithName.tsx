import { Avatar, Column, Row, Text } from '@envsemble/envui';

export default function PersonWithName() {
  return (
    <Row align="center" gap={3}>
      {/* The name is written beside it, so the avatar stays decorative. */}
      <Avatar name="Alex Morgan" size="lg" />
      <Column>
        <Text>Alex Morgan</Text>
        <Text variant="body-sm">alex.morgan@example.com</Text>
      </Column>
    </Row>
  );
}
