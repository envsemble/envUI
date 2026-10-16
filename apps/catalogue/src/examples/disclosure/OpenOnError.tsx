import { useState, type FormEvent } from 'react';
import { Button, Disclosure, Stack, TextField } from '@envsemble/envui';

export default function OpenOnError() {
  const [advanced, setAdvanced] = useState(false);
  const [domain, setDomain] = useState('docs example.com');
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalid = /\s/.test(domain);
    setError(invalid ? 'Remove the spaces from the domain.' : undefined);
    // An error inside the disclosure opens it, so the field and its message show.
    if (invalid) setAdvanced(true);
  };

  return (
    <form onSubmit={submit} noValidate style={{ inlineSize: 'min(100%, 26rem)' }}>
      <Stack gap={4}>
        <TextField label="Site name" defaultValue="Northwind help" />
        <Disclosure
          title="Advanced settings"
          open={advanced}
          onToggle={(event) => setAdvanced(event.currentTarget.open)}
        >
          <TextField
            label="Custom domain"
            hint="Leave empty to use the default address."
            value={domain}
            error={error}
            onChange={(event) => setDomain(event.target.value)}
          />
        </Disclosure>
        <Stack direction="row" wrap align="center" gap={4}>
          <Button type="submit">Save site</Button>
        </Stack>
      </Stack>
    </form>
  );
}
