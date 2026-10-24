import { Button, ConfirmButton, IconButton, Surface, Text } from '@envsemble/envui';

export function Emphasis({ variant, tone }) {
  return (
    <>
      <Button variant="primary" tone="accent">Publish</Button>
      <Button variant="primary" tone="danger" onClick={() => {}}>
        Delete
      </Button>
      <IconButton variant="ghost" icon={<span />} aria-label="Settings" />
      <ConfirmButton variant="outline" confirmLabel="Remove" onConfirm={() => {}}>
        Remove
      </ConfirmButton>
      <Button variant={variant}>Save</Button>
      <Button variant="primary">Next</Button>
      <Text emphasis="muted">Muted</Text>
      <Text emphasis="subtle" variant="body-sm">
        Note
      </Text>
      <Text emphasis={tone} variant="headline">
        Title
      </Text>
      <Surface background="muted" radius="sm" />
      <Surface background="raised" radius="none" />
    </>
  );
}
