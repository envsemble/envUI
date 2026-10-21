import { TextField } from '@envsemble/envui';

export default function LabelAndDescription() {
  return (
    <TextField
      label="Project handle"
      name="handle"
      description="Lowercase letters, numbers and hyphens."
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
