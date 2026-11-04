import { Column, TextField } from '@envsemble/envui';

export default function GhostForm() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 18rem)' }}>
      <TextField variant="ghost" label="Full name" name="name" autoComplete="name" />
      <TextField
        variant="ghost"
        label="E-mail address"
        name="email"
        type="email"
        autoComplete="email"
      />
    </Column>
  );
}
