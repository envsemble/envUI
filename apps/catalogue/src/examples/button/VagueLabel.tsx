import { Button, Stack, Text } from '@envsemble/envui';

export default function VagueLabel() {
  return (
    <Stack gap={4}>
      <Text>Sam Lee will lose access to the Northwind workspace.</Text>
      <Stack direction="row" wrap justify="end" gap={3}>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary" tone="danger">
          OK
        </Button>
      </Stack>
    </Stack>
  );
}
