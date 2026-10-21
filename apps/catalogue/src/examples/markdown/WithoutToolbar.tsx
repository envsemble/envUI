import { MarkdownEditor } from '@envsemble/envui/content';

export default function WithoutToolbar() {
  return (
    <MarkdownEditor
      label="Notes"
      sizing="content"
      rows={2}
      preview={false}
      toolbar={false}
      defaultValue="Ship the **pricing page** first."
    />
  );
}
