import { Button, Stack } from '@envsemble/envui';

export default function Variants() {
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Button>Continue</Button>
      <Button variant="primary" tone="accent">
        Confirm
      </Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="outline">Manage</Button>
      <Button variant="primary" tone="danger">
        Delete
      </Button>
      <Button variant="text">Learn more</Button>
      <Button variant="ghost">Settings</Button>
    </Stack>
  );
}
