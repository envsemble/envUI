import { MarkdownEditor } from '@envsemble/envui/content';

const note = `## Launch checklist

Prepare **Northwind** for the _spring_ launch.

- [x] Confirm the pricing with Priya Shah
- [ ] Send the release notes`;

export default function WriteNote() {
  // The note sits under the page's h2, so the preview's headings start one level lower. The
  // editor keeps one width in Write and Preview.
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
