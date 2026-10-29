import { useEffect, useRef, useState } from 'react';
import {
  Column,
  Composer,
  IconButton,
  Message,
  MessageList,
  type MessageStatus,
} from '@envsemble/envui';
import { IconAttachFile } from '@envsemble/envui/icons/AttachFile';

interface Entry {
  id: number;
  author?: string;
  time: string;
  text: string;
  status?: MessageStatus;
}

export default function BetweenPeople() {
  const [entries, setEntries] = useState<Entry[]>([
    { id: 1, author: 'Priya Shah', time: '09:12', text: 'The photos are in. Press kit by noon?' },
    { id: 2, author: 'Sam Lee', time: '09:15', text: 'Pricing page is signed off, too.' },
    { id: 3, time: '09:16', text: 'Great work, both of you.' },
  ]);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  function send(text: string) {
    const id = Date.now();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEntries((list) => [...list, { id, time, text, status: 'sending' }]);
    // A timer stands in for the server taking the message.
    timers.current.push(
      window.setTimeout(
        () =>
          setEntries((list) =>
            list.map((entry) => (entry.id === id ? { ...entry, status: undefined } : entry)),
          ),
        800,
      ),
    );
  }

  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 32rem)' }}>
      <MessageList aria-label="Launch team">
        {entries.map((entry) => (
          // Your own messages carry no author: the bubble says they are yours.
          <Message
            key={entry.id}
            from={entry.author ? 'other' : 'self'}
            author={entry.author}
            meta={entry.time}
            status={entry.status}
          >
            {entry.text}
          </Message>
        ))}
      </MessageList>
      <Composer
        aria-label="Message the launch team"
        placeholder="Write a message"
        start={<IconButton variant="text" icon={<IconAttachFile />} aria-label="Attach files" />}
        onSend={send}
      />
    </Column>
  );
}
