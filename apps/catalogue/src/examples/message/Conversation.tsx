import { useEffect, useRef, useState } from 'react';
import { Composer, Message, MessageList, Column } from '@envsemble/envui';

interface Entry {
  id: number;
  from: 'self' | 'other';
  text: string;
}

const answer =
  'Noted. I added it to the launch checklist and will remind Sam Lee on Friday, before the review.';

export default function Conversation() {
  const [messages, setMessages] = useState<Entry[]>([
    { id: 1, from: 'self', text: 'What is still open for the launch?' },
    {
      id: 2,
      from: 'other',
      text: 'Three items: the pricing page, the press kit and the support rota. Sam Lee owns the first two.',
    },
  ]);
  const [replying, setReplying] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);

  function stop() {
    window.clearInterval(timer.current);
    setReplying(false);
  }

  function send(text: string) {
    const id = Date.now();
    const words = answer.split(' ');
    let shown = 1;
    setMessages((list) => [
      ...list,
      { id, from: 'self', text },
      { id: id + 1, from: 'other', text: words[0] },
    ]);
    setReplying(true);
    // A timer stands in for a reply that streams in word by word.
    timer.current = window.setInterval(() => {
      shown += 1;
      const reply = words.slice(0, shown).join(' ');
      setMessages((list) =>
        list.map((entry) => (entry.id === id + 1 ? { ...entry, text: reply } : entry)),
      );
      if (shown === words.length) stop();
    }, 120);
  }

  return (
    <Column gap={5}>
      <MessageList aria-label="Conversation with the assistant" busy={replying}>
        {messages.map((entry) => (
          <Message
            key={entry.id}
            from={entry.from}
            author={entry.from === 'other' ? 'Assistant' : undefined}
          >
            {entry.text}
          </Message>
        ))}
      </MessageList>
      <Composer
        aria-label="Message the assistant"
        placeholder="Ask anything"
        onSubmit={send}
        running={replying}
        onStop={stop}
      />
    </Column>
  );
}
