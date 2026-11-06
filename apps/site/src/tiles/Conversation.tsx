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
  { id: 2, from: 'other', text: 'Priya Shah, for Friday.' },
];

// An answer to the question it follows, one line, as the first one is.
const question = 'Is the copy final?';
const reply = 'Yes, Sam signed it off.';

const input = '.env-composer-input';

/*
 * A question typed and sent: it joins the thread under the first exchange, the assistant works a
 * moment, the reply grows a few words at a time while the send button is Stop, the log following
 * the thread to its end as it outgrows it; a while to read it, and the thread is back to the first
 * exchange.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: input, x: 0.3 },
  { wait: 250 },
  { click: true },
  { wait: 200 },
  { type: question, into: input, every: 70 },
  { wait: 300 },
  { to: '.env-composer-action', duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 3000 },
  { to: '.env-message-list', x: 0.5, y: 0.4, duration: 500 },
  { wait: 1200 },
  { cue: 'reset' },
  { leave: true },
  { wait: 500 },
];

/** An exchange with an assistant above the composer, its reply streaming in as it is written. */
export default function ConversationTile() {
  const [entries, setEntries] = useState(history);
  const [replying, setReplying] = useState(false);
  // Before its first words arrive, the log's busy row stands where the reply will show.
  const [thinking, setThinking] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(undefined);
  const pause = useRef<number>(undefined);
  const frame = useRef(0);

  // Glides the log, a little each frame, to its end, so it follows the thread as it grows.
  const follow = useCallback(() => {
    if (frame.current) return;
    const step = () => {
      const node = log.current;
      if (!node) return;
      // At the end, as a log keeps the newest message in view while people are at its end.
      const target = node.scrollHeight - node.clientHeight;
      const left = target - node.scrollTop;
      if (Math.abs(left) < 1) {
        node.scrollTop = target;
        frame.current = 0;
        return;
      }
      const move = left * 0.25;
      node.scrollTop += Math.abs(move) < 1 ? Math.sign(left) : move;
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, []);

  useLayoutEffect(follow, [entries, thinking, follow]);
  useEffect(
    () => () => {
      window.clearInterval(timer.current);
      window.clearTimeout(pause.current);
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'reset') setEntries(history);
    },
  });

  function send(text: string) {
    const words = reply.split(' ');
    let shown = 1;
    setEntries([...history, { id: 3, from: 'self', text }]);
    setReplying(true);
    setThinking(true);
    // Timers stand in for a reply that comes after a moment and streams in a word at a time.
    pause.current = window.setTimeout(() => {
      setThinking(false);
      setEntries((list) => [...list, { id: 4, from: 'other', text: words[0] }]);
      timer.current = window.setInterval(() => {
        shown += 1;
        const text = words.slice(0, shown).join(' ');
        setEntries((list) => list.map((entry) => (entry.id === 4 ? { ...entry, text } : entry)));
        if (shown >= words.length) {
          window.clearInterval(timer.current);
          setReplying(false);
        }
      }, 150);
    }, 600);
  }

  return (
    <Column gap={4} style={{ inlineSize: '17rem' }}>
      <MessageList
        ref={log}
        aria-label="Conversation with the assistant"
        busy={thinking}
        busyAuthor="Assistant"
        // A set height with room under the first exchange for the next, which the thread grows
        // into, scrolling once it runs past it.
        style={{ blockSize: '9.375rem', overflowY: 'hidden' }}
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
          window.clearTimeout(pause.current);
          setThinking(false);
          setReplying(false);
        }}
      />
    </Column>
  );
}
