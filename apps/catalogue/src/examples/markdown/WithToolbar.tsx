import { MarkdownEditor } from '@envsemble/envui/content';

export default function WithToolbar() {
  return (
    <MarkdownEditor
      label="Notes"
      sizing="content"
      rows={2}
      preview={false}
      toolbar={['bold', 'italic', 'bullet-list', 'link']}
      defaultValue="Ship the **pricing page** first."
    />
  );
}
