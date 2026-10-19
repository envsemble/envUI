import { ActionGroup, Button, Stack } from '@envsemble/envui';

export function SpreadActions({ group, save }) {
  return (
    <>
      <ActionGroup {...group}>
        <Button>Save</Button>
      </ActionGroup>
      <Stack gap={2}>
        <Button {...save}>Save</Button>
        <Button fullWidth>Cancel</Button>
      </Stack>
    </>
  );
}
