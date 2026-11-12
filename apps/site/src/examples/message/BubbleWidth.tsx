import { Message, MessageList } from '@envsemble/envui';

export default function BubbleWidth() {
  return (
    <MessageList aria-label="Conversation with Sam Lee">
      <Message from="self">
        I booked Northwind Hall for Friday, from nine to five, with coffee at eleven.
      </Message>
    </MessageList>
  );
}
