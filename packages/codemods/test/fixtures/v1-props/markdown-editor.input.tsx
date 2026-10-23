import { MarkdownEditor } from '@envsemble/envui/content';

export function Notes({ value, onChange }) {
  return (
    <MarkdownEditor
      label="Notes"
      hint="Markdown is supported."
      variant="quiet"
      className="notes"
      value={value}
      onChange={onChange}
    />
  );
}
