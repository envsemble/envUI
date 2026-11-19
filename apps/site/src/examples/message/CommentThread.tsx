import { Avatar, Badge, Link, Message, MessageList, RelativeTime } from '@envsemble/envui';

const now = Date.parse('2026-03-12T10:00:00Z');

export default function CommentThread() {
  return (
    <MessageList aria-label="Comments on Website refresh">
      <Message
        from="other"
        start={<Avatar name="Priya Shah" size="sm" />}
        author={<Link href="/people/priya">Priya Shah</Link>}
        meta={<RelativeTime value="2026-03-12T08:15:00Z" now={now} />}
      >
        Can we move the pricing page review to Thursday?
      </Message>
      <Message
        from="other"
        start={<Avatar name="Review agent" hue="orchid" size="sm" />}
        author={
          <>
            Review agent <Badge>Bot</Badge>
          </>
        }
        meta={<RelativeTime value="2026-03-12T09:40:00Z" now={now} />}
      >
        Thursday works for Sam Lee and Alex Morgan. I moved the review.
      </Message>
    </MessageList>
  );
}
