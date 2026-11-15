'use client';

import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { message as messageMessages } from '../../foundations/messages/message.js';

export function MessageStatusLabel({
  status,
  label,
}: {
  status: 'sending' | 'failed' | 'working';
  label: string | undefined;
}) {
  const messages = useMessages('message', messageMessages);
  return <span>{label ?? messages[status]}</span>;
}
