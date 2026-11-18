import { useEffect, useRef, useState } from 'react';
import { Composer, Column, Text } from '@envsemble/envui';

const simulatedSendMs = 1500;

export default function PendingSend() {
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = (text: string) => {
    setSending(true);
    timer.current = window.setTimeout(() => {
      setLog((current) => [...current, text]);
      setSending(false);
    }, simulatedSendMs);
  };

  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 32rem)' }}>
      <Composer
        aria-label="Reply to Priya Shah"
        placeholder="Write a reply"
        pending={sending}
        onSend={send}
        description={sending ? 'Sending…' : 'Replies go to the whole thread.'}
      />
      <Text variant="caption" emphasis="muted" role="status">
        {log.length > 0 && `${log.length} ${log.length === 1 ? 'reply' : 'replies'} sent.`}
      </Text>
    </Column>
  );
}
