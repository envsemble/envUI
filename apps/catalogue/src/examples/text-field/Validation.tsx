import { useState } from 'react';
import { Stack, TextField } from '@envsemble/envui';

const handlePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function Validation() {
  const [handle, setHandle] = useState('Northwind Launch');
  // Check the value once people leave the field; here they already have.
  const [checked, setChecked] = useState(true);
  const error =
    checked && !handlePattern.test(handle)
      ? 'Use only lowercase letters, numbers and hyphens, such as northwind-launch.'
      : undefined;
  return (
    // As wide as a form column.
    <Stack style={{ inlineSize: 'min(100%, 24rem)' }}>
      <TextField
        label="Project handle"
        name="handle"
        prefix="example.com/"
        hint="Used in links to the project."
        value={handle}
        onChange={(event) => setHandle(event.target.value)}
        onBlur={() => setChecked(true)}
        error={error}
      />
    </Stack>
  );
}
