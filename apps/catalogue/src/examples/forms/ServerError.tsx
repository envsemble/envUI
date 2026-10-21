import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, Column, Row, Text, TextField, Textarea } from '@envsemble/envui';

export default function ServerError() {
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saved, setSaved] = useState('');
  const alert = useRef<HTMLDivElement>(null);
  const attempts = useRef(0);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // The failure Alert takes focus as it appears, so people hear what happened and where they are.
  useEffect(() => {
    if (failed) alert.current?.focus();
  }, [failed]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFailed(false);
    setSaved('');
    attempts.current += 1;
    // The changes go to a server; a timer stands in for it, and the first attempt fails.
    timer.current = window.setTimeout(() => {
      setSaving(false);
      if (attempts.current === 1) setFailed(true);
      else setSaved('Changes saved.');
    }, 1200);
  };

  return (
    <form noValidate onSubmit={submit}>
      {/* envUI has no form column yet: one column, kept to a width that reads easily. */}
      <Column gap={5} style={{ maxInlineSize: '32rem' }}>
        {failed && (
          <Alert ref={alert} tabIndex={-1} tone="danger" title="Your changes weren’t saved">
            Check your connection and try again. What you entered is still here.
          </Alert>
        )}
        {/* The fields keep what people typed, whatever the server answered. */}
        <TextField label="Project name" name="name" defaultValue="Quarterly report" />
        <Textarea
          label="Description (optional)"
          name="description"
          rows={3}
          defaultValue="Results and highlights for the first quarter of 2026."
        />
        <Row wrap gap={3}>
          <Button type="submit" pending={saving}>
            Save changes
          </Button>
        </Row>
        <Text role="status" emphasis="muted">
          {saved}
        </Text>
      </Column>
    </form>
  );
}
