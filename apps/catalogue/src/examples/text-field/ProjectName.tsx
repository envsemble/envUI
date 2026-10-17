import { Stack, TextField } from '@envsemble/envui';

export default function ProjectName() {
  return (
    // As wide as a form column.
    <Stack style={{ inlineSize: 'min(100%, 24rem)' }}>
      <TextField
        label="Project name"
        name="project"
        description="A name your team will know at a glance."
      />
    </Stack>
  );
}
