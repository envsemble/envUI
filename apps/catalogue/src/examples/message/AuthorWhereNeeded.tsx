import { Message, MessageList } from '@envsemble/envui';

export default function AuthorWhereNeeded() {
  return (
    <MessageList aria-label="Conversation with Sam Lee">
      <Message from="other" author="Sam Lee" meta="09:40">
        Can you send me the venue address?
      </Message>
      <Message from="self" meta="09:41">
        Northwind Hall, 12 Harbour Street.
      </Message>
    </MessageList>
  );
}
