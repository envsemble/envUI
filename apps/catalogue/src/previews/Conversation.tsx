import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Composer,
  IconButton,
  Kbd,
  Message,
  MessageList,
  Text,
  type MessageStatus,
} from '@envsemble/envui';
import { AttachFile } from '@envsemble/envui/icons/AttachFile';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { Example } from './Example';
import { Preview } from './Preview';

/** A reply that ends on its own after a few seconds, unless it is stopped first. */
function useSimulatedReply() {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setRunning(false), 4000);
    return () => clearTimeout(timer);
  }, [running]);
  return [running, setRunning] as const;
}

export function ComposerPreview() {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState('');
  const [running, setRunning] = useSimulatedReply();
  const [comments, setComments] = useState(0);
  return (
    <Preview>
      <Example
        title="Message field"
        caption={
          <>
            <Kbd>Enter</Kbd> sends and <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> starts a new line. While
            the reply runs, the button stops it.
          </>
        }
      >
        <Composer
          aria-label="Message"
          placeholder="Ask anything"
          value={draft}
          onValueChange={setDraft}
          onSubmit={(text) => {
            setSent(text);
            setDraft('');
            setRunning(true);
          }}
          running={running}
          onStop={() => setRunning(false)}
        />
        <Text variant="caption" role="status">
          {running ? 'Replying…' : sent ? `Sent: ${sent}` : 'Nothing sent yet.'}
        </Text>
      </Example>
      <Example
        title="Start content and a footer"
        caption="Start content moves the button to an action row. The footer describes the field."
      >
        <Composer
          aria-label="Comment"
          placeholder="Add a comment"
          minRows={2}
          maxRows={6}
          start={
            <>
              <IconButton variant="text" icon={<AttachFile />} aria-label="Attach files" />
              <span>Design review</span>
            </>
          }
          footer={
            comments === 0
              ? 'Files up to 10 MB.'
              : `${comments} ${comments === 1 ? 'comment' : 'comments'} added.`
          }
          onSubmit={() => setComments((count) => count + 1)}
        />
      </Example>
    </Preview>
  );
}

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
