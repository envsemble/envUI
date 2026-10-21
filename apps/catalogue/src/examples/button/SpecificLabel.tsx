import { Button, Stack, Text } from '@envsemble/envui';

export default function SpecificLabel() {
  return (
    <Stack gap={4}>
      <Text>Sam Lee will lose access to the Northwind workspace.</Text>
      <Stack direction="row" wrap justify="end" gap={3}>
        <Button variant="secondary">Keep access</Button>
        <Button variant="primary" tone="danger">
          Remove Sam Lee
        </Button>
      </Stack>
    </Stack>
  );
}
