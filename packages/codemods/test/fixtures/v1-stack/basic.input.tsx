import { Button, Stack, Text } from '@envsemble/envui';

export function Form({ onSave }: { onSave: () => void }) {
  return (
    <Stack gap={5} render={<form />}>
      <Text>Project details</Text>
      <Stack direction="row" wrap align="center" justify="end">
        <Button variant="secondary">Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </Stack>
      <Stack
        direction="column"
        gap={2}
      >
        <Text>One</Text>
      </Stack>
      <Stack direction={'row'} gap={0} />
    </Stack>
  );
}
