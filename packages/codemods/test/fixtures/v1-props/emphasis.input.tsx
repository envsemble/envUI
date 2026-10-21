import { Button, ConfirmButton, IconButton, Surface, Text } from '@envsemble/envui';

export function Emphasis({ variant, tone }) {
  return (
    <>
      <Button variant="important">Publish</Button>
      <Button variant="destructive" onClick={() => {}}>
        Delete
      </Button>
      <IconButton variant="quiet" icon={<span />} aria-label="Settings" />
      <ConfirmButton variant="outlined" confirmLabel="Remove?" onConfirm={() => {}}>
        Remove
      </ConfirmButton>
      <Button variant={variant}>Save</Button>
      <Button variant="primary">Next</Button>
      <Text tone="muted">Muted</Text>
      <Text tone="quiet" variant="supporting">
        Note
      </Text>
      <Text tone={tone} variant="page-heading">
        Title
      </Text>
      <Surface tone="row" corners="standard" />
      <Surface tone="alternate" corners="none" />
    </>
  );
}
