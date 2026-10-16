import { useEffect, useRef, useState } from 'react';
import { Button, Message, MessageList, type MessageStatus } from '@envsemble/envui';

export default function DeliveryStatus() {
  const [status, setStatus] = useState<MessageStatus | undefined>('failed');
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function retry() {
    setStatus('sending');
    // A timer stands in for sending the message again.
    timer.current = window.setTimeout(() => setStatus(undefined), 1500);
  }

  return (
    <MessageList aria-label="Conversation with Sam Lee">
      <Message from="other" author="Sam Lee" meta="09:40">
        Can you send me the venue address?
      </Message>
      <Message
        from="self"
        meta="09:41"
        status={status}
        actions={
          status === 'failed' && (
            <Button variant="text" onClick={retry}>
              Retry
            </Button>
          )
        }
      >
        {'Northwind Hall\n12 Harbour Street'}
      </Message>
    </MessageList>
  );
}
