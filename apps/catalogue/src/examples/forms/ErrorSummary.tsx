import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, Link, Select, Stack, Text, TextField } from '@envsemble/envui';

type FieldName = 'name' | 'email' | 'team';
type Values = Record<FieldName, string>;

/** Each field's message, in the order of the form, for the fields that are wrong. */
function validate(values: Values) {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!values.name.trim()) errors.name = 'Enter your full name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Enter an email address like name@example.com';
  if (!values.team) errors.team = 'Choose a team';
  return errors;
}

export default function ErrorSummary() {
  const id = useId();
  const [values, setValues] = useState<Values>({ name: '', email: 'sam.lee@', team: '' });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState('');
  const summary = useRef<HTMLDivElement>(null);
  // Counts the refused submits; each moves focus to the summary once it has rendered.
  const [refused, setRefused] = useState(0);
  useEffect(() => {
    if (refused) summary.current?.focus();
  }, [refused]);
  const fields = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    team: useRef<HTMLButtonElement>(null),
  };

  const change = (field: FieldName, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // After a submit, an error goes as soon as its field is fixed; no new one appears while typing.
    if (submitted)
      setErrors((current) =>
        validate(next)[field] ? current : { ...current, [field]: undefined },
      );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSubmitted(true);
    if (Object.keys(found).length) {
      setSaved('');
      setRefused((count) => count + 1);
      return;
    }
    setSaved('Your details are saved.');
  };

  const listed = (Object.keys(fields) as FieldName[]).filter((field) => errors[field]);
  return (
    <form noValidate onSubmit={submit}>
      {/* envUI has no form column yet: one column, kept to a width that reads easily. */}
      <Stack gap={5} style={{ maxInlineSize: '32rem' }}>
        {listed.length > 0 && (
          // envUI has no error summary yet: a danger Alert that takes focus lists the errors, each
          // linked to its field.
          <Alert ref={summary} tabIndex={-1} tone="danger" title="There is a problem">
            <Stack render={<ul />} gap={1}>
              {listed.map((field) => (
                <li key={field}>
                  <Link
                    href={`#${id}-${field}`}
                    onClick={(event) => {
                      // Focus the field itself; following the fragment would only scroll to it.
                      event.preventDefault();
                      fields[field].current?.focus();
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
          ref={fields.name}
          id={`${id}-name`}
          label="Full name"
          name="name"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onValueChange={(value) => change('name', value)}
        />
        <TextField
          ref={fields.email}
          id={`${id}-email`}
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          value={values.email}
          error={errors.email}
          onValueChange={(value) => change('email', value)}
        />
        <Select
          ref={fields.team}
          id={`${id}-team`}
          label="Team"
          name="team"
          placeholder="Choose a team"
          items={teams}
          value={values.team || null}
          error={errors.team}
          onValueChange={(value) => change('team', value ?? '')}
        />
        <Stack direction="row" wrap gap={3}>
          <Button type="submit">Save details</Button>
        </Stack>
        <Text role="status" emphasis="muted">
          {saved}
        </Text>
      </Stack>
    </form>
  );
}

const teams = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'operations', label: 'Operations' },
];
