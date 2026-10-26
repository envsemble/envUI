import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Column,
  Composer,
  Message,
  MessageList,
  type MessageStatus,
} from '@envsemble/envui';

interface Entry {
  id: number;
  from: 'self' | 'other';
  text: string;
  status?: MessageStatus;
}

export default function FailedSend() {
  const [entries, setEntries] = useState<Entry[]>([
    { id: 1, from: 'other', text: 'Is the venue confirmed for Friday?' },
  ]);
  const composer = useRef<HTMLTextAreaElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const update = (id: number, change: Partial<Entry>) =>
    setEntries((list) => list.map((entry) => (entry.id === id ? { ...entry, ...change } : entry)));

  function deliver(id: number, reached: boolean) {
    update(id, { status: 'sending' });
    // A timer stands in for the server: here a first send can't reach it, and a second one does.
    timers.current.push(
      window.setTimeout(() => update(id, { status: reached ? undefined : 'failed' }), 1200),
    );
  }

  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 32rem)' }}>
      <MessageList aria-label="Conversation with Sam Lee">
        {entries.map((entry) => (
          <Message
            key={entry.id}
            from={entry.from}
            author={entry.from === 'other' ? 'Sam Lee' : undefined}
            status={entry.status}
            actions={
              entry.status === 'failed' && (
                <Button
                  variant="text"
                  onClick={() => {
                    deliver(entry.id, true);
                    // Try again leaves with the failure, so focus goes back to the composer.
                    composer.current?.focus();
                  }}
                >
                  Try again
                </Button>
              )
            }
          >
            {entry.text}
          </Message>
        ))}
      </MessageList>
      <Composer
        ref={composer}
        aria-label="Message Sam Lee"
        placeholder="Write a message"
        onSubmit={(text) => {
          const id = Date.now();
          setEntries((list) => [...list, { id, from: 'self', text }]);
          deliver(id, false);
        }}
      />
    </Column>
  );
}
