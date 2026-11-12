import { Column, Composer, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';

const stop = () => undefined;

export default function ReplyAsItArrives() {
  return (
    // Shown part way through a reply.
    <Column gap={4} style={{ inlineSize: 'min(100%, 26rem)' }}>
      <MessageList aria-label="Conversation with the assistant" busy>
        <Message from="self">Who owns the press kit?</Message>
        <Message from="other" author="Assistant">
          <Markdown>Priya Shah. She expects the photos from the studio on</Markdown>
        </Message>
      </MessageList>
      <Composer
        aria-label="Message the assistant"
        placeholder="Ask anything"
        running
        onStop={stop}
      />
    </Column>
  );
}
