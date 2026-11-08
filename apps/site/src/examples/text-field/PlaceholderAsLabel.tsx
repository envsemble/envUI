import { TextField } from '@envsemble/envui';

export default function PlaceholderAsLabel() {
  return (
    <TextField
      visibleLabel={false}
      label="Project handle"
      name="handle"
      placeholder="Handle: lowercase letters, numbers and hyphens"
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
