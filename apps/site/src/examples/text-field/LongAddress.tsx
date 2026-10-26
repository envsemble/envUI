import { TextField } from '@envsemble/envui';

export default function LongAddress() {
  return (
    <TextField
      label="Address"
      name="slug"
      prefix="https://example.com/projects/"
      defaultValue="northwind-launch"
    />
  );
}
