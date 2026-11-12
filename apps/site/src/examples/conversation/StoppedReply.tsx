import { useEffect, useRef, useState } from 'react';
import { Button, Column, Composer, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/markdown';

const note = `Hi all,

The launch is on Friday at nine. Before then, Sam Lee signs off the pricing page, Priya Shah \
sends the press kit for review, and Alex Morgan fills the weekend shifts.

Thanks for the push this week.`;

// Shown after Stop, part way through the note.
const stoppedAt = 14;

export default function StoppedReply() {
  const words = note.split(' ');
  const [shown, setShown] = useState(stoppedAt);
  const [replying, setReplying] = useState(false);
  const [question, setQuestion] = useState('Write a short note to the team about Friday.');
  const composer = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const stopped = !replying && shown < words.length;

  function stop() {
    window.clearInterval(timer.current);
    setReplying(false);
  }

  function tryAgain() {
    let count = 1;
    setShown(count);
    setReplying(true);
    // Try again leaves while the new reply runs, so focus goes back to the composer.
    composer.current?.focus();
    // A timer stands in for a new reply that streams in a few words at a time.
    timer.current = window.setInterval(() => {
      count += 2;
      setShown(Math.min(count, words.length));
      if (count >= words.length) stop();
    }, 120);
  }

  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 32rem)' }}>
      <MessageList aria-label="Conversation with the assistant" busy={replying}>
        <Message from="self">{question}</Message>
        <Message
          from="other"
          author="Assistant"
          meta={stopped ? 'Stopped' : undefined}
          actions={
            stopped && (
              <Button variant="text" onClick={tryAgain}>
                Try again
              </Button>
            )
          }
        >
          <Markdown>{words.slice(0, shown).join(' ')}</Markdown>
        </Message>
      </MessageList>
      <Composer
        ref={composer}
        aria-label="Message the assistant"
        placeholder="Ask anything"
        onSend={(text) => {
          setQuestion(text);
          tryAgain();
        }}
        running={replying}
        onStop={stop}
      />
    </Column>
  );
}
