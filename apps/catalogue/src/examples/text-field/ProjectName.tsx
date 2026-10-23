import { TextField } from '@envsemble/envui';

export default function ProjectName() {
  return (
    <TextField
      label="Project name"
      name="project"
      description="A name your team will know at a glance."
      style={{ inlineSize: 'min(100%, 20rem)' }}
    />
  );
}
