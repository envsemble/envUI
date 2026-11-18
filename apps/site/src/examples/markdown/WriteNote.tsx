import { MarkdownEditor } from '@envsemble/envui/markdown';

const note = `## Launch checklist

Prepare **Northwind** for the _spring_ launch.

- [x] Confirm the pricing with Priya Shah
- [ ] Send the release notes`;

export default function WriteNote() {
  return (
    <MarkdownEditor
      style={{ inlineSize: 'min(100%, 30rem)' }}
      label="Note"
      sizing="content"
      rows={6}
      defaultValue={note}
      previewProps={{ headingOffset: 1 }}
    />
  );
}
