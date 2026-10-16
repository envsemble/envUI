import { useRef } from 'react';
import { Button, Stack } from '@envsemble/envui';
import { RichTextEditor, type RichTextEditorHandle } from '@envsemble/envui/rich-text';

export default function EditorCommands() {
  const editorRef = useRef<RichTextEditorHandle>(null);
  return (
    <Stack gap={4}>
      <RichTextEditor ref={editorRef} label="Reply" defaultValue="Thanks, the dates work for us." />
      <Button
        variant="secondary"
        onClick={() =>
          // Tiptap's commands change the document from outside the editor.
          editorRef.current?.editor?.chain().focus('end').insertContent(' — Alex Morgan').run()
        }
      >
        Add signature
      </Button>
    </Stack>
  );
}
