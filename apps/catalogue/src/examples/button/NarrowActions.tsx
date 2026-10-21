import { Button, Stack } from '@envsemble/envui';

export default function NarrowActions() {
  return (
    <Stack direction="row" wrap justify="end" gap={3}>
      <Button variant="secondary">Cancel</Button>
      <Button>Save and publish the draft</Button>
    </Stack>
  );
}
