import { Column, Composer, Message, MessageList, Spinner } from '@envsemble/envui';

const stop = () => undefined;

export default function WholeReplyAtOnce() {
  return (
    // Shown while the whole reply is awaited, with nothing to read.
    <Column gap={4} style={{ inlineSize: 'min(100%, 26rem)' }}>
      <MessageList aria-label="Conversation with the assistant" busy>
        <Message from="self">Who owns the press kit?</Message>
        <Message from="other" author="Assistant">
          <Spinner size="sm" label="Thinking" />
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
