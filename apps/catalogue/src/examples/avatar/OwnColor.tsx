import { Avatar, Stack, Text } from '@envsemble/envui';

export default function OwnColor() {
  return (
    <Stack direction="row" wrap align="center" gap={5}>
      <Stack direction="row" align="center" gap={3}>
        {/* The organization's own color, rather than the one its name would give. */}
        <Avatar name="Northwind Labs" fallback="initials" hue="teal" />
        <Text>Northwind Labs</Text>
      </Stack>
      <Stack direction="row" align="center" gap={3}>
        <Avatar name="Harbor Studio" fallback="initials" hue="amber" />
        <Text>Harbor Studio</Text>
      </Stack>
    </Stack>
  );
}
