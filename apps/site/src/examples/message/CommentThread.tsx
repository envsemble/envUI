import { useState } from 'react';
import { Message, MessageList, RelativeTime } from '@envsemble/envui';

const hour = 60 * 60_000;

export default function CommentThread() {
  const [now] = useState(() => Date.now());
  const comments = [
    { id: 1, author: 'Priya Shah', at: now - 5 * hour, text: 'The hero image feels too dark.' },
    { id: 2, author: 'Sam Lee', at: now - 3 * hour, text: 'I can try the lighter crop.' },
    { id: 3, author: 'Priya Shah', at: now - 40 * 60_000, text: 'The lighter crop works.' },
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
