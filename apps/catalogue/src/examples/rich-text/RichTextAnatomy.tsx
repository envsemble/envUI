import { RichTextEditor } from '@envsemble/envui/rich-text';

const notes = `[reference id="person%3Apriya" label="Priya%20Shah" kind="person" mentionSuggestionChar="%40"] sends the **press kit**.

- [ ] Book the venue`;

export default function RichTextAnatomy() {
  return (
    <RichTextEditor
      label="Meeting notes"
      description="Shared with the launch team."
      defaultValue={notes}
      toolbar={['bold', 'italic', 'task-list', 'link']}
    />
  );
}
