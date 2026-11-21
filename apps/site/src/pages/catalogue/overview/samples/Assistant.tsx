import {
  Composer,
  Message,
  MessageList,
} from '@envsemble/envui';

export const Assistant = () => (
  <>
    <MessageList aria-label="Conversation">
      <Message from="self">What is left?</Message>
      <Message from="other">The pricing page.</Message>
    </MessageList>
    <Composer aria-label="Message" />
  </>
);
