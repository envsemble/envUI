import { Button, Stack, Text } from '@envsemble/envui';

export default function SeveralPrimaryActions() {
  return (
    <Stack gap={4}>
      <Text>Publish the release notes to everyone on the team?</Text>
      <Stack direction="row" wrap justify="end" gap={3}>
        <Button>Preview</Button>
        <Button>Save draft</Button>
        <Button>Publish</Button>
      </Stack>
    </Stack>
  );
}
