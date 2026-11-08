'use client';

import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { message as messageMessages } from '../../foundations/messages/message.js';

/**
 * A message's status text, or a busy list's: the label it is given, else the nearest EnvUIProvider's
 * `messages.message`, else English. A client leaf, so Message stays a server component.
 */
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
