import { useRef, useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { IconAlternateEmail } from '@envsemble/envui/icons/AlternateEmail';
import { MarkdownEditor, type MarkdownEditorHandle } from '@envsemble/envui/markdown';

export default function OwnToolbarButtons() {
  const [comment, setComment] = useState('Looks good to me. ');
  const editor = useRef<MarkdownEditorHandle>(null);
  return (
    <MarkdownEditor
      label="Comment"
      sizing="content"
      rows={3}
      toolbar={['bold', 'italic', 'link']}
      editorRef={editor}
      toolbarEnd={
        <Toolbar.Button
          icon={<IconAlternateEmail />}
          label="Mention Priya Shah"
          onClick={() => editor.current?.insert('@priya ')}
        />
      }
      value={comment}
      onValueChange={setComment}
    />
  );
}
