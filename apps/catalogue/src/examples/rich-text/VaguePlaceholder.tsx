import { RichTextEditor } from '@envsemble/envui/rich-text';

export default function VaguePlaceholder() {
  return (
    <RichTextEditor
      label="Text"
      placeholder="Enter text here"
      toolbar={['bold', 'italic', 'link']}
    />
  );
}
