import { MarkdownEditor } from '@envsemble/envui/content';

export function Notes({ value, onChange }) {
  return (
    <MarkdownEditor
      label="Notes"
      description="Markdown is supported."
      variant="ghost"
      className="notes"
      value={value}
      onChange={onChange}
    />
  );
}
