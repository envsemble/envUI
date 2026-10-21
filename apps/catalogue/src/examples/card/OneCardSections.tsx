import { Card, Stack, Text } from '@envsemble/envui';

export default function OneCardSections() {
  return (
    <Card title="Northwind launch" meta="Due 14 November">
      <Stack gap={1}>
        <Text variant="caption">Owner</Text>
        <Text>Priya Shah</Text>
      </Stack>
      <Stack gap={1}>
        <Text variant="caption">Open tasks</Text>
        <Text>12, of which 3 are overdue</Text>
      </Stack>
    </Card>
  );
}
