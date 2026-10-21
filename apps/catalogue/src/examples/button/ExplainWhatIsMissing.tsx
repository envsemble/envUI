import { Button, Stack, TextField } from '@envsemble/envui';

export default function ExplainWhatIsMissing() {
  return (
    <Stack gap={4}>
      <TextField label="Project name" error="Enter a name for the project." />
      <Stack direction="row" justify="end">
        <Button>Create project</Button>
      </Stack>
    </Stack>
  );
}
