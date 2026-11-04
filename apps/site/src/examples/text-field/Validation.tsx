import { useState } from 'react';
import { Column, TextField } from '@envsemble/envui';

const handlePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const handleError = 'Use only lowercase letters, numbers and hyphens, such as northwind-launch.';

export default function Validation() {
  // As people left it: a handle that doesn't fit, and its error.
  const [handle, setHandle] = useState('Northwind Launch');
  const [error, setError] = useState<string | undefined>(handleError);
  return (
    // As wide as a form column.
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <TextField
        label="Project handle"
        name="handle"
        prefix="example.com/"
        description="Used in links to the project."
        autoComplete="off"
        spellCheck={false}
        value={handle}
        onValueChange={(value) => {
          setHandle(value);
          // While people type, an error only goes, as soon as the handle fits.
          if (error && handlePattern.test(value)) setError(undefined);
        }}
        // Checked once people leave the field.
        onBlur={() => setError(handle && !handlePattern.test(handle) ? handleError : undefined)}
        error={error}
      />
    </Column>
  );
}
