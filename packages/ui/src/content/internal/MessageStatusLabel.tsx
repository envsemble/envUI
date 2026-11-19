'use client';

import type { ReactNode } from 'react';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { message as messageMessages } from '../../foundations/messages/message.js';

export function MessageStatusLabel({
  status,
  label,
}: {
  status: 'sending' | 'failed' | 'working';
  label: ReactNode;
}) {
  const messages = useMessages('message', messageMessages);
  return <span>{label ?? messages[status]}</span>;
}
