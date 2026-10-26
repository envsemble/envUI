import { TextField } from '@envsemble/envui';

export default function ReadOnlyValue() {
  return (
    <TextField
      label="Project ID"
      name="project-id"
      defaultValue="PRJ-2041"
      readOnly
      style={{ inlineSize: 'min(100%, 16rem)' }}
    />
  );
}
