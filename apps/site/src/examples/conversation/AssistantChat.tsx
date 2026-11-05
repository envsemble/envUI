import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Button, Column, Composer, CopyButton, Grid, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';
import { IconArrowDownward } from '@envsemble/envui/icons/ArrowDownward';

interface Entry {
  id: number;
  from: 'self' | 'other';
  text: string;
  stopped?: boolean;
}

const history: Entry[] = [
  { id: 1, from: 'self', text: 'What is still open for the launch on Friday?' },
  {
    id: 2,
    from: 'other',
    text: `Three things:

1. **Pricing page**: Sam Lee is checking the last prices.
2. **Press kit**: waiting for two photos.
3. **Support rota**: the weekend shifts are empty.`,
  },
  { id: 3, from: 'self', text: 'Who owns the press kit?' },
  {
    id: 4,
    from: 'other',
    text: 'Priya Shah. She expects the photos from the studio on Wednesday morning.',
  },
];

const reply = `Here is a plan for the rest of the week:

- **Tuesday**: Sam Lee signs off the pricing page.
- **Wednesday**: Priya Shah adds the photos and sends the press kit for review.
- **Thursday**: Alex Morgan fills the weekend shifts of the support rota.

Shall I send this to the launch channel?`;

export default function AssistantChat() {
  const [entries, setEntries] = useState(history);
  const [replying, setReplying] = useState(false);
  // Whether people are at the end of the log, where new words keep them.
  const [atEnd, setAtEnd] = useState(true);
  const log = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);

  // At the end, each new word keeps the newest line in view; once people scroll up to read, the
  // log stays where they are.
  useLayoutEffect(() => {
    if (atEnd && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [entries, atEnd]);

  function finish(stopped: boolean) {
    window.clearInterval(timer.current);
    setReplying(false);
    // A stopped reply keeps what arrived, marked as stopped.
    if (stopped)
      setEntries((list) =>
        list.map((entry, index) =>
          index === list.length - 1 ? { ...entry, stopped: true } : entry,
        ),
      );
  }

  function send(text: string) {
    const id = Date.now();
    const words = reply.split(' ');
    let shown = 1;
    setAtEnd(true);
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
      if (shown >= words.length) finish(false);
    }, 90);
  }

  function jumpToLatest() {
    const node = log.current;
    if (!node) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({ top: node.scrollHeight, behavior: still ? 'auto' : 'smooth' });
    // The button leaves once the end is in view, so focus moves to the log it scrolled.
    node.focus();
  }

  return (
    // As tall as a chat panel, so the log scrolls above the composer that stays at its foot.
    <Column gap={4} style={{ inlineSize: 'min(100%, 36rem)', blockSize: '30rem' }}>
      {/* The log and the jump button share one cell, the button over the log's lower edge. */}
      <Grid style={{ flex: 1, minBlockSize: 0, gridTemplateRows: 'minmax(0, 1fr)' }}>
        <MessageList
          ref={log}
          aria-label="Conversation with the assistant"
          busy={replying}
          // The log scrolls, so it takes focus for people who scroll with the keyboard.
          tabIndex={0}
          onScroll={(event) => {
            const node = event.currentTarget;
            setAtEnd(node.scrollHeight - node.scrollTop - node.clientHeight < 24);
          }}
          style={{ gridArea: '1 / 1', overflowY: 'auto', paddingInline: '0.25rem' }}
        >
          {entries.map((entry, index) =>
            entry.from === 'self' ? (
              <Message key={entry.id} from="self">
                {entry.text}
              </Message>
            ) : (
              <Message
                key={entry.id}
                from="other"
                author="Assistant"
                meta={entry.stopped ? 'Stopped' : undefined}
                actions={
                  // Copy waits until the reply is complete.
                  !(replying && index === entries.length - 1) && (
                    <CopyButton variant="text" value={entry.text} aria-label="Copy answer" />
                  )
                }
              >
                <Markdown>{entry.text}</Markdown>
              </Message>
            ),
          )}
        </MessageList>
        {!atEnd && (
          <Button
            variant="outline"
            size="sm"
            startIcon={<IconArrowDownward />}
            onClick={jumpToLatest}
            style={
              {
                // Over the log, whose list items are positioned and would otherwise paint above it.
                position: 'relative',
                gridArea: '1 / 1',
                alignSelf: 'end',
                justifySelf: 'center',
                marginBlockEnd: '0.5rem',
                // Filled with the page's color, so the messages it floats over don't show through.
                '--env-button-container': 'var(--env-color-bg-page)',
              } as CSSProperties
            }
          >
            Latest
          </Button>
        )}
      </Grid>
      <Composer
        aria-label="Message the assistant"
        placeholder="Ask anything"
        onSend={send}
        running={replying}
        onStop={() => finish(true)}
      />
    </Column>
  );
}
