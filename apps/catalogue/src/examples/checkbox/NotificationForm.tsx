import { useState, type FormEvent } from 'react';
import { Button, Checkbox, Column, Row, Text } from '@envsemble/envui';

export default function NotificationForm() {
  const [sent, setSent] = useState<string>();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // A checked box submits its name with its value; an unchecked one submits nothing.
    const chosen = new FormData(event.currentTarget).getAll('notify');
    setSent(chosen.length ? `E-mails for ${chosen.join(', ')}` : 'No e-mails');
  };
  return (
    <form onSubmit={submit} onReset={() => setSent(undefined)}>
      <Column gap={4}>
        {/* envUI has no checkbox group yet: a fieldset names the choices, read with each one. */}
        <fieldset style={{ minInlineSize: 0, margin: 0, padding: 0, border: 0 }}>
          <legend style={{ padding: 0, marginBlockEnd: '0.75rem' }}>
            <Text render={<span />} variant="title">
              Send me an e-mail about
            </Text>
          </legend>
          <Column gap={3}>
            <Checkbox name="notify" value="mentions" label="Mentions" defaultChecked />
            <Checkbox name="notify" value="comments" label="Comments on my plans" defaultChecked />
            <Checkbox name="notify" value="digest" label="A weekly digest" />
          </Column>
        </fieldset>
        <Row wrap align="center" gap={4}>
          <Button type="submit">Save preferences</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </Row>
        <Text variant="caption" emphasis="muted" role="status">
          {sent && `Saved: ${sent}.`}
        </Text>
      </Column>
    </form>
  );
}
