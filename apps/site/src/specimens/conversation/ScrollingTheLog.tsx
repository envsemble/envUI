import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Column, Composer, Grid, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';
import { ArrowDownward } from '@envsemble/envui/icons/ArrowDownward';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { Renew } from '../../previews/Renew';

const question = 'What is still open for the launch on Friday?';

const earlier = `Three things:

1. **Pricing page**: Sam Lee is checking the last prices.
2. **Press kit**: waiting for two photos.
3. **Support rota**: the weekend shifts are empty.`;

const reply = `Here is a plan for the rest of the week:

- **Monday**: Sam Lee checks the last prices.
- **Tuesday**: Sam Lee signs off the pricing page.
- **Wednesday**: Priya Shah adds the photos to the press kit.
- **Wednesday**: Priya Shah sends the press kit for review.
- **Thursday**: Alex Morgan fills the weekend shifts.
- **Friday**: the launch at nine, with the whole team.

Shall I send this to the launch channel?`;

const words = reply.split(' ');

const stop = () => undefined;

/*
 * A reply streams in, and the log keeps its newest line in view. The pointer turns the wheel up to
 * read: the log stays where it is while the reply goes on arriving below, and Latest appears. The
 * pointer presses Latest, and the log glides to the end. Then the conversation starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { cue: 'reply' },
  { wait: 1500 },
  { to: '.env-message-list', x: 0.5, y: 0.4, duration: 500 },
  { wheel: -170, duration: 700 },
  { wait: 1300 },
  { to: '.env-message-list + .env-button', x: 0.5, y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1500 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

/** The conversation, with a reply that arrives a word at a time once `replying` is set. */
function Log({ replying }: { replying: boolean }) {
  const [shown, setShown] = useState(0);
  const [atEnd, setAtEnd] = useState(true);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!replying) return;
    const timer = window.setInterval(
      () => setShown((count) => Math.min(count + 1, words.length)),
      110,
    );
    return () => window.clearInterval(timer);
  }, [replying]);
  // At the end, each new word keeps the newest line in view; scrolled up, the log stays.
  useLayoutEffect(() => {
    if (atEnd && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [shown, atEnd]);
  const running = replying && shown < words.length;
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 28rem)', blockSize: '19rem' }}>
      <Grid style={{ flex: 1, minBlockSize: 0, gridTemplateRows: 'minmax(0, 1fr)' }}>
        <MessageList
          ref={log}
          aria-label="Conversation with the assistant"
          busy={running}
          onScroll={(event) => {
            const node = event.currentTarget;
            setAtEnd(node.scrollHeight - node.scrollTop - node.clientHeight < 24);
          }}
          style={{ gridArea: '1 / 1', overflowY: 'auto', paddingInline: '0.25rem' }}
        >
          <Message from="self">{question}</Message>
          <Message from="other" author="Assistant">
            <Markdown>{earlier}</Markdown>
          </Message>
          <Message from="self">Plan the rest of the week for us.</Message>
          {shown > 0 && (
            <Message from="other" author="Assistant">
              <Markdown>{words.slice(0, shown).join(' ')}</Markdown>
            </Message>
          )}
        </MessageList>
        {!atEnd && (
          <Button
            variant="outline"
            size="sm"
            startIcon={<ArrowDownward />}
            onClick={() =>
              log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' })
            }
            style={{
              gridArea: '1 / 1',
              alignSelf: 'end',
              justifySelf: 'center',
              marginBlockEnd: '0.5rem',
            }}
          >
            Latest
          </Button>
        )}
      </Grid>
      <Composer
        aria-label="Message the assistant"
        placeholder="Ask anything"
        running={running}
        onStop={stop}
      />
    </Column>
  );
}

function Scrolling() {
  const [round, setRound] = useState(0);
  const [replying, setReplying] = useState(false);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'reply') setReplying(true);
      else {
        setRound((count) => count + 1);
        setReplying(false);
      }
    },
  });
  return (
    <Renew round={round}>
      <Log replying={replying} />
    </Renew>
  );
}

/** A log that keeps the newest line in view, scrolled up and back by a pointer no one sees. */
export default function ScrollingTheLog() {
  return (
    <MotionStage label="the log keeping the newest line in view">
      <Scrolling />
    </MotionStage>
  );
}
