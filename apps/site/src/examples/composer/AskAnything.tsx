import { useEffect, useRef, useState } from 'react';
import { Composer, Column, Text } from '@envsemble/envui';

const simulatedReplyMs = 4000;

export default function AskAnything() {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState('');
  const [running, setRunning] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = (text: string) => {
    setSent(text);
    setDraft('');
    setRunning(true);
    timer.current = window.setTimeout(() => setRunning(false), simulatedReplyMs);
  };
  const stop = () => {
    window.clearTimeout(timer.current);
    setRunning(false);
  };

  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 32rem)' }}>
      <Composer
        aria-label="Message"
        placeholder="Ask anything"
        value={draft}
        onValueChange={setDraft}
        onSend={send}
        running={running}
        onStop={stop}
      />
      <Text variant="caption" emphasis="muted" role="status">
        {running ? 'Replying…' : sent ? `Sent: ${sent}` : ''}
      </Text>
    </Column>
  );
}
