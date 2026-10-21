'use client';

import { useMessages } from '../../internal/EnvUIContext.js';
import { common } from '../../foundations/messages/common.js';

/**
 * The label a Spinner shows with showLabel: its own, or the provider's messages.common.loading. A
 * client leaf, so Spinner itself stays a server component.
 */
export function SpinnerLabel({ label }: { label?: string }) {
  const messages = useMessages('common', common);
  return <span className="env-spinner-label">{label ?? messages.loading}</span>;
}
