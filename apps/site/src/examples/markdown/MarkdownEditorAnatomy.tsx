import { MarkdownEditor } from '@envsemble/envui/markdown';

export default function MarkdownEditorAnatomy() {
  return (
    <MarkdownEditor
      label="Description"
      description="Markdown: headings, lists, links and code."
      sizing="content"
      rows={2}
      defaultValue="Ship the **pricing page** first."
    />
  );
}
