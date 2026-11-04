import { useEffect, useRef, useState } from 'react';
import { Button, Column, Composer, Grid, Message, MessageList, Row, Text } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';

interface Entry {
  id: number;
  from: 'self' | 'other';
  text: string;
}

const suggestions = [
  'Summarize this week in Northwind',
  'Draft a reply to Sam Lee',
  'What is still open for the launch?',
];

const reply =
  'Here is the short version: the pricing page is signed off, the press kit waits for two ' +
  'photos, and the support rota still needs weekend shifts.';

export default function FirstMessage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [replying, setReplying] = useState(false);
  const composer = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);

  function stop() {
    window.clearInterval(timer.current);
    setReplying(false);
  }

  function send(text: string) {
    const id = Date.now();
    const words = reply.split(' ');
    let shown = 1;
    setEntries((list) => [
      ...list,
      { id, from: 'self', text },
      { id: id + 1, from: 'other', text: words[0] },
    ]);
    setReplying(true);
    // A timer stands in for a reply that streams in a few words at a time.
    timer.current = window.setInterval(() => {
      shown += 2;
      const text = words.slice(0, shown).join(' ');
      setEntries((list) => list.map((entry) => (entry.id === id + 1 ? { ...entry, text } : entry)));
      if (shown >= words.length) stop();
    }, 90);
  }

  return (
    // As tall as a chat panel, with the composer at its foot from the start.
    <Column gap={4} style={{ inlineSize: 'min(100%, 36rem)', blockSize: '22rem' }}>
      {/* The welcome sits where the log will be; the log is there, empty, from the start, so it
          announces the first messages. */}
      <Grid style={{ flex: 1, minBlockSize: 0, gridTemplateRows: 'minmax(0, 1fr)' }}>
        <MessageList
          aria-label="Conversation with the assistant"
          busy={replying}
          style={{ gridArea: '1 / 1', overflowY: 'auto' }}
        >
          {entries.map((entry) => (
            <Message
              key={entry.id}
              from={entry.from}
              author={entry.from === 'other' ? 'Assistant' : undefined}
            >
              {entry.from === 'other' ? <Markdown>{entry.text}</Markdown> : entry.text}
            </Message>
          ))}
        </MessageList>
        {entries.length === 0 && (
          <Column gap={4} align="center" justify="center" style={{ gridArea: '1 / 1' }}>
            <Text variant="title" render={<h3 />}>
              What can I help with?
            </Text>
            <Row wrap gap={2} justify="center">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    send(suggestion);
                    // The suggestions leave with the first message, so focus goes to the composer.
                    composer.current?.focus();
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </Row>
          </Column>
        )}
      </Grid>
      <Composer
        ref={composer}
        aria-label="Message the assistant"
        placeholder="Ask anything"
        onSend={send}
        running={replying}
        onStop={stop}
      />
    </Column>
  );
}
