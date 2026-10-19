import { useState, type FormEvent } from 'react';
import { Button, Stack, Text } from '@envsemble/envui';
import { RichTextEditor } from '@envsemble/envui/rich-text';

export default function ReleaseNotesForm() {
  const [error, setError] = useState<string>();
  const [published, setPublished] = useState('');
  function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The editor submits its Markdown under its name.
    const notes = String(new FormData(event.currentTarget).get('notes') ?? '').trim();
    setError(notes ? undefined : 'Write what changed before publishing.');
    setPublished(notes ? 'Release notes published.' : '');
  }
  return (
    <Stack gap={4} render={<form onSubmit={publish} noValidate />}>
      <RichTextEditor
        name="notes"
        label="Release notes"
        description="Shown to everyone in the workspace."
        error={error}
        placeholder="What changed in this release?"
        toolbar={['heading', 'bold', 'italic', 'bullet-list', 'link']}
      />
      <Button type="submit">Publish</Button>
      <Text variant="body-sm" role="status">
        {published}
      </Text>
    </Stack>
  );
}
