import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { IconAlternateEmail } from '@envsemble/envui/icons/AlternateEmail';
import { MarkdownEditor } from '@envsemble/envui/markdown';

export default function OwnToolbarButtons() {
  const [comment, setComment] = useState('Looks good to me. ');
  return (
    <MarkdownEditor
      label="Comment"
      sizing="content"
      rows={3}
      toolbar={['bold', 'italic', 'link']}
      toolbarEnd={({ insert }) => (
        <Toolbar.Button
          icon={<IconAlternateEmail />}
          label="Mention Priya Shah"
          onClick={() => insert('@priya ')}
        />
      )}
      value={comment}
      onValueChange={setComment}
    />
  );
}
