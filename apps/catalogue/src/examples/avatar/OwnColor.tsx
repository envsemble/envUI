import { Avatar, Row, Text } from '@envsemble/envui';

export default function OwnColor() {
  return (
    <Row wrap align="center" gap={5}>
      <Row align="center" gap={3}>
        {/* The organization's own color, rather than the one its name would give. */}
        <Avatar name="Northwind Labs" fallback="initials" hue="teal" />
        <Text>Northwind Labs</Text>
      </Row>
      <Row align="center" gap={3}>
        <Avatar name="Harbor Studio" fallback="initials" hue="amber" />
        <Text>Harbor Studio</Text>
      </Row>
    </Row>
  );
}
