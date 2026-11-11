import { CopyButton, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';

const answer = `Here is the plan for next week:

1. **Monday**: freeze the pricing page.
2. **Wednesday**: send the press kit to Priya Shah for review.
3. **Friday**: publish the announcement at \`09:00\` local time.`;

export default function FormattedAnswer() {
  return (
    <MessageList aria-label="Conversation with the assistant">
      <Message from="self">Plan the launch week, day by day.</Message>
      <Message
        from="other"
        author="Assistant"
        actions={<CopyButton variant="text" value={answer} aria-label="Copy answer" />}
      >
        <Markdown>{answer}</Markdown>
      </Message>
    </MessageList>
  );
}
