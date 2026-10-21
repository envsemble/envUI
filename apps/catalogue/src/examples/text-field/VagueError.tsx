import { TextField } from '@envsemble/envui';

export default function VagueError() {
  return (
    <TextField
      label="Project handle"
      name="handle"
      defaultValue="Northwind Launch"
      error="Invalid handle."
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
