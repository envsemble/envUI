import { useEffect, useRef, useState } from 'react';
import { Composer } from '@envsemble/envui';

export default function DisabledWhileSending() {
  const [sending, setSending] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const send = () => {
    setSending(true);
    timer.current = window.setTimeout(() => setSending(false), 1500);
  };
  return (
    <Composer
      aria-label="Message"
      placeholder="Write a message"
      // Wrong: disabling the field while sending takes focus away, so people can't keep writing.
      disabled={sending}
      onSend={send}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    />
  );
}
