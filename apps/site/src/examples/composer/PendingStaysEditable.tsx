import { useEffect, useRef, useState } from 'react';
import { Composer } from '@envsemble/envui';

export default function PendingStaysEditable() {
  const [sending, setSending] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const send = () => {
    setSending(true);
    // Stands in for a request: the next message waits, and the field stays editable meanwhile.
    timer.current = window.setTimeout(() => setSending(false), 1500);
  };
  return (
    <Composer
      aria-label="Message"
      placeholder="Write a message"
      pending={sending}
      onSend={send}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    />
  );
}
