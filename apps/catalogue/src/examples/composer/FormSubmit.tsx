import { useState, type FormEvent } from 'react';
import { Composer, Stack, Text } from '@envsemble/envui';

export default function FormSubmit() {
  const [sent, setSent] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Without onSubmit, Enter and the send button submit the form, which sends the field by name.
    setSent(String(new FormData(event.currentTarget).get('note')));
    event.currentTarget.reset();
  };
  return (
    <form onSubmit={submit}>
      <Stack gap={3}>
        <Composer name="note" aria-label="Note" placeholder="Add a note to the plan" />
        <Text variant="caption" tone="muted" role="status">
          {sent && `Added: ${sent}`}
        </Text>
      </Stack>
    </form>
  );
}
