import { TextField } from '@envsemble/envui';

export default function HelpfulError() {
  return (
    <TextField
      label="Project handle"
      name="handle"
      defaultValue="Northwind Launch"
      error="Use lowercase letters and hyphens, such as northwind-launch."
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
