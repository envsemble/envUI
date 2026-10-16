import { ActionGroup, Button, Stack, Text } from '@envsemble/envui';

export default function ProjectDetails() {
  return (
    <Stack>
      <Text as="h3" variant="section-heading">
        Project details
      </Text>
      <Text>Shared plans and notes for the Northwind launch.</Text>
      <Text variant="supporting">Updated today by Sam Lee</Text>
      <ActionGroup>
        <Button>Open project</Button>
        <Button variant="secondary">Share</Button>
      </ActionGroup>
    </Stack>
  );
}
