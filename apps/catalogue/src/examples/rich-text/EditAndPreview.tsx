import { useState } from 'react';
import { Column, Surface, Text } from '@envsemble/envui';
import { RichText, RichTextEditor } from '@envsemble/envui/rich-text';

const lastMeeting = `### Launch review

Decisions from **Tuesday**:

- [x] Freeze the pricing page
- [ ] Send the press kit to Priya Shah`;

export default function EditAndPreview() {
  // The value is Markdown, saved as it is and shown again with RichText.
  const [notes, setNotes] = useState(lastMeeting);
  return (
    <Column gap={5}>
      <RichTextEditor label="Meeting notes" value={notes} onValueChange={setNotes} />
      <Surface background="muted" padding={4} render={<Column gap={2} />}>
        <Text variant="body-sm">Preview</Text>
        <RichText>{notes}</RichText>
      </Surface>
    </Column>
  );
}
