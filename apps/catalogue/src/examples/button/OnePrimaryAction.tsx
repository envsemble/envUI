import { Button, Stack, Text } from '@envsemble/envui';

export default function OnePrimaryAction() {
  return (
    <Stack gap={4}>
      <Text>Publish the release notes to everyone on the team?</Text>
      <Stack direction="row" wrap justify="end" gap={3}>
        <Button variant="secondary">Save draft</Button>
        <Button>Publish</Button>
      </Stack>
    </Stack>
  );
}
