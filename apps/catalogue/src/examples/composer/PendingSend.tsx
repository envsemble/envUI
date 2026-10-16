import { useEffect, useRef, useState } from 'react';
import { Composer, Stack, Text } from '@envsemble/envui';

export default function PendingSend() {
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = (text: string) => {
    setSending(true);
    // Stands in for a request; the field stays editable for the next message meanwhile.
    timer.current = window.setTimeout(() => {
      setLog((current) => [...current, text]);
      setSending(false);
    }, 1500);
  };

  return (
    <Stack gap={3}>
      <Composer
        aria-label="Reply to Priya Shah"
        placeholder="Write a reply"
        pending={sending}
        onSubmit={send}
        footer={sending ? 'Sending…' : 'Replies go to the whole thread.'}
      />
      <Text variant="caption" tone="muted" role="status">
        {log.length > 0 && `${log.length} ${log.length === 1 ? 'reply' : 'replies'} sent.`}
      </Text>
    </Stack>
  );
}
