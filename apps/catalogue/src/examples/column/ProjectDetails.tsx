import { Button, Stack, Text } from '@envsemble/envui';

export default function ProjectDetails() {
  return (
    <Stack>
      <Text render={<h3 />} variant="title">
        Project details
      </Text>
      <Text>Shared plans and notes for the Northwind launch.</Text>
      <Text variant="body-sm">Updated today by Sam Lee</Text>
      <Stack direction="row" wrap align="center" gap={4}>
        <Button>Open project</Button>
        <Button variant="secondary">Share</Button>
      </Stack>
    </Stack>
  );
}
