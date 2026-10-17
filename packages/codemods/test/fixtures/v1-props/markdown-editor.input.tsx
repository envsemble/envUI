import { MarkdownEditor } from '@envsemble/envui/content';

export function Notes({ value, onChange }) {
  return (
    <MarkdownEditor
      label="Notes"
      hint="Markdown is supported."
      variant="plain"
      className="notes"
      value={value}
      onChange={onChange}
    />
  );
}
