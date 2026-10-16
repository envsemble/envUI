import { useState } from 'react';
import { Message, MessageList, RelativeTime } from '@envsemble/envui';

const hour = 60 * 60_000;

export default function CommentThread() {
  const [now] = useState(() => Date.now());
  const comments = [
    {
      id: 1,
      author: 'Priya Shah',
      at: now - 5 * hour,
      text: 'The hero image feels too dark on phones.',
    },
    {
      id: 2,
      author: 'Sam Lee',
      at: now - 3 * hour,
      text: 'Agreed. I can try the lighter crop from the shoot.',
    },
    {
      id: 3,
      author: 'Alex Morgan',
      at: now - 40 * 60_000,
      text: 'Lighter crop is in the draft now.',
    },
  ];
  return (
    <MessageList aria-label="Comments on the landing page">
      {comments.map((comment) => (
        <Message
          key={comment.id}
          from="other"
          author={comment.author}
          meta={<RelativeTime value={comment.at} />}
        >
          {comment.text}
        </Message>
      ))}
    </MessageList>
  );
}
