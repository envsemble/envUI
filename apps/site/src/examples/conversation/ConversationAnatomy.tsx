import { Column, Composer, CopyButton, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';

const answer = `Three things are open:

- the pricing page;
- the press kit;
- the support rota.`;

const send = () => undefined;

export default function ConversationAnatomy() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <MessageList aria-label="Conversation with the assistant">
        <Message
          from="other"
          author="Assistant"
          actions={<CopyButton variant="text" value={answer} aria-label="Copy answer" />}
        >
          <Markdown>{answer}</Markdown>
        </Message>
        <Message from="self">Remind Sam Lee about the pricing page.</Message>
      </MessageList>
      <Composer aria-label="Message the assistant" placeholder="Ask anything" onSend={send} />
    </Column>
  );
}
