import { Button, Message, MessageList } from '@envsemble/envui';

export default function MessageAnatomy() {
  return (
    <MessageList
      aria-label="Conversation with the assistant"
      style={{ inlineSize: 'min(100%, 24rem)' }}
    >
      <Message from="other" author="Assistant" meta="09:40" actions={<Button>Reply</Button>}>
        The review is on Friday.
      </Message>
      <Message from="self" status="sending">
        Thanks!
      </Message>
    </MessageList>
  );
}
