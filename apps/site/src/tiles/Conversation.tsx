import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Column, Composer, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';
import { usePointer, type PointerStep } from '../motion/Motion';

interface Entry {
  id: number;
  from: 'self' | 'other';
  text: string;
}

const history: Entry[] = [
  { id: 1, from: 'self', text: 'Who owns the press kit?' },
  { id: 2, from: 'other', text: 'Priya Shah. She expects the photos today.' },
];

const reply = 'Sam Lee. He is checking the last prices.';

const input = '.env-composer-input';

/*
 * A question typed and sent: the log moves up to it, the reply grows a few words at a time while
 * the send button is Stop, and once it is complete, the log is scrolled back up to where it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: input, x: 0.3 },
  { wait: 250 },
  { click: true },
  { wait: 200 },
  { type: 'And the prices?', into: input, every: 90 },
  { wait: 300 },
  { to: '.env-composer-action', duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 2600 },
  { to: '.env-message-list', x: 0.5, y: 0.4, duration: 500 },
  { wait: 200 },
  { cue: 'back' },
  { wait: 1300 },
  { cue: 'reset' },
  { leave: true },
  { wait: 500 },
];

/** An exchange with an assistant above the composer, its reply streaming in as it is written. */
export default function ConversationTile() {
  const [entries, setEntries] = useState(history);
  const [replying, setReplying] = useState(false);
  // The log is as tall as the exchange it starts with, and scrolls to what comes after.
  const [height, setHeight] = useState<number>();
  const log = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(undefined);
  // Where the log is going: its end, following the reply, or its start, read again.
  const goal = useRef<'end' | 'start'>('end');
  const frame = useRef(0);

  // Glides the log to where it is going, a little each frame, so it follows the reply smoothly.
  const follow = useCallback(() => {
    if (frame.current) return;
    const step = () => {
      const node = log.current;
      if (!node) return;
      const target = goal.current === 'end' ? node.scrollHeight - node.clientHeight : 0;
      const left = target - node.scrollTop;
      if (Math.abs(left) < 1) {
        node.scrollTop = target;
        frame.current = 0;
        return;
      }
      const move = left * 0.12;
      node.scrollTop += Math.abs(move) < 1 ? Math.sign(left) : move;
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, []);

  useLayoutEffect(() => setHeight(log.current?.offsetHeight), []);
  useLayoutEffect(follow, [entries, follow]);
  useEffect(
    () => () => {
      window.clearInterval(timer.current);
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'back') goal.current = 'start';
      if (cue === 'reset') {
        // Scrolled back to the start, what came after is out of view, so it goes unseen.
        goal.current = 'end';
        setEntries(history);
      }
      follow();
    },
  });

  function send(text: string) {
    const words = reply.split(' ');
    let shown = 1;
    goal.current = 'end';
    setEntries([
      ...history,
      { id: 3, from: 'self', text },
      { id: 4, from: 'other', text: words[0] },
    ]);
    setReplying(true);
    // A timer stands in for a reply that streams in a word at a time.
    timer.current = window.setInterval(() => {
      shown += 1;
      const text = words.slice(0, shown).join(' ');
      setEntries((list) => list.map((entry) => (entry.id === 4 ? { ...entry, text } : entry)));
      if (shown >= words.length) {
        window.clearInterval(timer.current);
        setReplying(false);
      }
    }, 150);
  }

  return (
    <Column gap={4} style={{ inlineSize: '14rem' }}>
      <MessageList
        ref={log}
        aria-label="Conversation with the assistant"
        busy={replying}
        style={{ blockSize: height, overflowY: 'hidden' }}
      >
        {entries.map((entry) =>
          entry.from === 'self' ? (
            <Message key={entry.id} from="self">
              {entry.text}
            </Message>
          ) : (
            <Message key={entry.id} from="other" author="Assistant">
              <Markdown>{entry.text}</Markdown>
            </Message>
          ),
        )}
      </MessageList>
      <Composer
        aria-label="Message the assistant"
        placeholder="Ask anything"
        onSend={send}
        running={replying}
        onStop={() => {
          window.clearInterval(timer.current);
          setReplying(false);
        }}
      />
    </Column>
  );
}
