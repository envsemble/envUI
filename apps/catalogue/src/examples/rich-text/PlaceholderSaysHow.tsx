import { RichTextEditor } from '@envsemble/envui/rich-text';

export default function PlaceholderSaysHow() {
  return (
    <RichTextEditor
      label="Meeting notes"
      placeholder="Type @ to mention someone"
      toolbar={['bold', 'italic', 'link']}
    />
  );
}
