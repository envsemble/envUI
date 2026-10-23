import { TextField } from '@envsemble/envui';

export default function PlaceholderAsLabel() {
  return (
    <TextField
      showLabel={false}
      label="Project handle"
      name="handle"
      placeholder="Handle: lowercase letters, numbers and hyphens"
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
