import { useState, type FormEvent } from 'react';
import { Button, DropZone, Stack, Text, TextField } from '@envsemble/envui';

export default function InAForm() {
  const [sent, setSent] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // A named zone submits the last files it took, dropped ones too.
    const files = new FormData(event.currentTarget)
      .getAll('attachments')
      .filter((entry): entry is File => entry instanceof File && entry.name !== '');
    setSent(files.length ? `Sent with ${files.map((file) => file.name).join(', ')}.` : 'Sent.');
  };
  return (
    <form onSubmit={submit} onReset={() => setSent('')} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <Stack>
        <TextField label="Subject" name="subject" defaultValue="Quarterly figures" />
        <DropZone
          size="sm"
          multiple
          name="attachments"
          label="Attach files"
          description="Sent with the message"
          onDropAccepted={() => setSent('')}
        />
        <Stack direction="row" wrap align="center" gap={4}>
          <Button type="submit">Send</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </Stack>
        <Text variant="caption" emphasis="muted" role="status">
          {sent}
        </Text>
      </Stack>
    </form>
  );
}
