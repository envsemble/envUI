import { Column, TextField } from '@envsemble/envui';

export default function OutlineForm() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 18rem)' }}>
      <TextField label="Full name" name="name" autoComplete="name" />
      <TextField label="E-mail address" name="email" type="email" autoComplete="email" />
    </Column>
  );
}
