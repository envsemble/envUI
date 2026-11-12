import { RichTextEditor } from '@envsemble/envui/rich-text';

export default function FewCommands() {
  return (
    <RichTextEditor
      label="Comment"
      placeholder="Add a comment"
      toolbar={['bold', 'italic', 'link']}
    />
  );
}
