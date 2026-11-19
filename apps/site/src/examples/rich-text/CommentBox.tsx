import { useState } from 'react';
import { Avatar, Button, Column, Text, Toolbar } from '@envsemble/envui';
import { RichTextEditor, type RichTextReferenceSource } from '@envsemble/envui/rich-text';
import { IconAutoAwesome } from '@envsemble/envui/icons/AutoAwesome';
import { IconSend } from '@envsemble/envui/icons/Send';

const people = [
  { id: 'person:alex', label: 'Alex Morgan', email: 'alex@example.com' },
  { id: 'person:sam', label: 'Sam Lee', email: 'sam@example.com' },
  { id: 'person:priya', label: 'Priya Shah', email: 'priya@example.com' },
];

const references: RichTextReferenceSource[] = [
  {
    trigger: '@',
    label: 'People',
    search: ({ query }) =>
      people
        .filter((person) => person.label.toLowerCase().includes(query.toLowerCase()))
        .map(({ id, label }) => ({ id, label, kind: 'person' })),
    renderSuggestion: (reference) => ({
      start: <Avatar name={reference.label} size="sm" />,
      description: people.find((person) => person.id === reference.id)?.email,
    }),
  },
];

export default function CommentBox() {
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState('');
  return (
    <Column gap={3}>
      <RichTextEditor
        label="Comment"
        placeholder="Type @ to mention someone"
        minRows={2}
        value={comment}
        onValueChange={setComment}
        references={references}
        toolbar={['bold', 'italic', 'link']}
        toolbarEnd={<Toolbar.Button icon={<IconAutoAwesome />} label="Improve the writing" />}
        footer={
          <Button
            variant="primary"
            size="sm"
            startIcon={<IconSend />}
            disabled={comment.trim() === ''}
            onClick={() => {
              setSent(comment);
              setComment('');
            }}
          >
            Send
          </Button>
        }
      />
      <Text variant="body-sm" role="status">
        {sent && 'Comment sent'}
      </Text>
    </Column>
  );
}
