import { TextField } from '@envsemble/envui';

export default function DisabledValue() {
  return (
    <TextField
      label="Project ID"
      name="project-id"
      defaultValue="PRJ-2041"
      disabled
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
