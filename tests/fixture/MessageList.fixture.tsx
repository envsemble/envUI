import { useState } from 'react';
import { Button, Column, Message, MessageList } from '@envsemble/envui';

const first = Array.from({ length: 12 }, (_, index) => `Message ${index + 1}`);

export default function MessageListFixture() {
  const [messages, setMessages] = useState(first);
  return (
    <Column gap={3} className="fixture-section">
      <Column style={{ blockSize: '16rem' }}>
        <MessageList aria-label="Conversation" follow data-testid="following">
          {messages.map((text, index) => (
            <Message key={text} from={index % 2 ? 'other' : 'self'}>
              {text}
            </Message>
          ))}
        </MessageList>
      </Column>
      <Button
        onClick={() => setMessages((list) => [...list, `Message ${list.length + 1}`])}
        data-testid="add"
      >
        Add a message
      </Button>
      <Column style={{ blockSize: '10rem' }}>
        <MessageList aria-label="Renamed" follow jumpToLatestLabel="Newest" data-testid="renamed">
          {messages.map((text) => (
            <Message key={text} from="other">
              {text}
            </Message>
          ))}
        </MessageList>
      </Column>
    </Column>
  );
}
