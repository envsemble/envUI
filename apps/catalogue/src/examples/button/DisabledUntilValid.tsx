import { Button, Stack, TextField } from '@envsemble/envui';

export default function DisabledUntilValid() {
  return (
    <Stack gap={4}>
      <TextField label="Project name" />
      <Stack direction="row" justify="end">
        <Button disabled>Create project</Button>
      </Stack>
    </Stack>
  );
}
