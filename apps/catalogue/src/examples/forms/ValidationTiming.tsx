import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, Link, Stack, Text, TextField } from '@envsemble/envui';

type FieldName = 'address' | 'email';

const rules: Record<FieldName, (value: string) => string | undefined> = {
  address: (value) =>
    !value
      ? 'Enter a workspace address'
      : /^[a-z0-9-]+$/.test(value)
        ? undefined
        : 'Use only lowercase letters, numbers and hyphens',
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? undefined
      : 'Enter an email address like name@example.com',
};

export default function ValidationTiming() {
  const id = useId();
  const [values, setValues] = useState<Record<FieldName, string>>({ address: '', email: '' });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  // A field is checked when people leave it only once they have typed in it.
  const edited = useRef(new Set<FieldName>());
  const [result, setResult] = useState('');
  const refs = {
    address: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
  };
  // The fields the last refused submit listed; each refusal moves focus to the summary.
  const [listed, setListed] = useState<FieldName[]>([]);
  const summary = useRef<HTMLDivElement>(null);
  const [refused, setRefused] = useState(0);
  useEffect(() => {
    if (refused) summary.current?.focus();
  }, [refused]);

  const change = (field: FieldName, value: string) => {
    edited.current.add(field);
    setValues((current) => ({ ...current, [field]: value }));
    // While people type, an error only goes away, as soon as the value is fixed.
    if (errors[field] && !rules[field](value))
      setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const leave = (field: FieldName) => {
    if (edited.current.has(field))
      setErrors((current) => ({ ...current, [field]: rules[field](values[field]) }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = { address: rules.address(values.address), email: rules.email(values.email) };
    setErrors(found);
    const wrong = (Object.keys(found) as FieldName[]).filter((field) => found[field]);
    setListed(wrong);
    if (wrong.length) {
      setResult('');
      setRefused((count) => count + 1);
      return;
    }
    setResult(`Workspace example.com/${values.address} created.`);
  };

  return (
    <form noValidate onSubmit={submit}>
      {/* envUI has no form column yet: one column, kept to a width that reads easily. */}
      <Stack gap={5} style={{ maxInlineSize: '32rem' }}>
        {listed.some((field) => errors[field]) && (
          // Two fields or more: a refused submit lists the errors at the top and moves focus there.
          <Alert
            ref={summary}
            tabIndex={-1}
            tone="danger"
            title={
              <span role="heading" aria-level={2}>
                There is a problem
              </span>
            }
          >
            <Stack render={<ul />} gap={1}>
              {listed
                .filter((field) => errors[field])
                .map((field) => (
                  <li key={field}>
                    <Link
                      href={`#${id}-${field}`}
                      onClick={(event) => {
                        event.preventDefault();
                        refs[field].current?.focus();
                      }}
                    >
                      {errors[field]}
                    </Link>
                  </li>
                ))}
            </Stack>
          </Alert>
        )}
        <TextField
          ref={refs.address}
          id={`${id}-address`}
          label="Workspace address"
          name="address"
          prefix="example.com/"
          description="Lowercase letters, numbers and hyphens"
          autoComplete="off"
          spellCheck={false}
          value={values.address}
          error={errors.address}
          onValueChange={(value) => change('address', value)}
          onBlur={() => leave('address')}
        />
        <TextField
          ref={refs.email}
          id={`${id}-email`}
          label="Billing email address"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          value={values.email}
          error={errors.email}
          onValueChange={(value) => change('email', value)}
          onBlur={() => leave('email')}
        />
        <Stack direction="row" wrap gap={3}>
          <Button type="submit">Create workspace</Button>
        </Stack>
        <Text role="status" emphasis="muted">
          {result}
        </Text>
      </Stack>
    </form>
  );
}
