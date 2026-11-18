import { useState } from 'react';
import { RichTextEditor } from '@envsemble/envui/rich-text';

const lastMeetingMarkdown = `### Launch review

Decisions from **Tuesday**:

- [x] Freeze the pricing page
- [ ] Send the press kit to Priya Shah`;

export default function MeetingNotes() {
  const [notes, setNotes] = useState(lastMeetingMarkdown);
  return <RichTextEditor label="Meeting notes" value={notes} onValueChange={setNotes} />;
}
