import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Composer,
  IconButton,
  Message,
  MessageList,
  type MessageStatus,
} from '@envsemble/envui';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { Example } from './Example';
import { Preview } from './Preview';

interface DemoMessage {
  id: number;
  from: 'self' | 'other';
  text: string;
  time: string;
  status?: MessageStatus;
}

const firstMessages: DemoMessage[] = [
  { id: 1, from: 'self', time: '09:41', text: 'Summarize the quarterly report.' },
  {
    id: 2,
    from: 'other',
    time: '09:41',
    text: 'Revenue grew in every region this quarter. Two risks stay open: the design-system/tokens migration is behind schedule, and support hiring trails the plan by two people.',
  },
  {
    id: 3,
    from: 'self',
    time: '09:43',
    text: 'Share the summary with the team.',
    status: 'failed',
  },
];

export function MessagesPreview() {
  const [messages, setMessages] = useState(firstMessages);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState<number>();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function later(callback: () => void, delay: number) {
    timers.current.push(setTimeout(callback, delay));
  }
  function update(id: number, change: Partial<DemoMessage>) {
    setMessages((list) =>
      list.map((message) => (message.id === id ? { ...message, ...change } : message)),
    );
  }
  function deliver(id: number) {
    update(id, { status: 'sending' });
    setRunning(true);
    later(() => update(id, { status: undefined }), 700);
    later(() => {
      setMessages((list) => [
        ...list,
        {
          id: Date.now(),
          from: 'other',
          time: '09:45',
          text: 'Done. The team has the summary, with both risks marked for the next review.',
        },
      ]);
      setRunning(false);
    }, 2200);
  }

  return (
    <Preview>
      <Example
        title="Conversation"
        caption="Your own messages are bubbles at the end; answers fill the width. Try sending, retrying or stopping."
      >
        <MessageList aria-label="Conversation with Aurora">
          {messages.map((message) =>
            message.from === 'self' ? (
              <Message
                key={message.id}
                from="self"
                meta={message.time}
                status={message.status}
                actions={
                  message.status === 'failed' && (
                    <Button variant="text" onClick={() => deliver(message.id)}>
                      Retry
                    </Button>
                  )
                }
              >
                {message.text}
              </Message>
            ) : (
              <Message
                key={message.id}
                from="other"
                author="Aurora"
                meta={message.time}
                actions={
                  <IconButton
                    variant="text"
                    icon={<ContentCopy />}
                    aria-label={copied === message.id ? 'Copied' : 'Copy answer'}
                    title={copied === message.id ? 'Copied' : 'Copy answer'}
                    onClick={() => setCopied(message.id)}
                  />
                }
              >
                {message.text}
              </Message>
            ),
          )}
        </MessageList>
        <Composer
          aria-label="Message Aurora"
          placeholder="Ask anything"
          running={running}
          onStop={() => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
            setMessages((list) =>
              list.map((message) =>
                message.status === 'sending' ? { ...message, status: undefined } : message,
              ),
            );
            setRunning(false);
          }}
          onSubmit={(text) => {
            const id = Date.now();
            setMessages((list) => [...list, { id, from: 'self', time: '09:44', text }]);
            deliver(id);
          }}
        />
      </Example>
    </Preview>
  );
}
