'use client';

import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { common } from '../../foundations/messages/common.js';

export function SpinnerLabel({ label }: { label?: string }) {
  const messages = useMessages('common', common);
  return <span className="env-spinner-label">{label ?? messages.loading}</span>;
}
