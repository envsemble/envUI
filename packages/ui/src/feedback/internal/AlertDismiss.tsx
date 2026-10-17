'use client';

import { CloseButton } from '../../actions/CloseButton.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { alert } from '../../foundations/messages/alert.js';

/**
 * An Alert's dismiss button: a small CloseButton in the alert's tone, named by the alert's label or
 * the provider's messages.alert.dismiss. A client leaf, so Alert itself stays a server component.
 */
export function AlertDismiss({ label, onDismiss }: { label?: string; onDismiss: () => void }) {
  const messages = useMessages('alert', alert);
  const name = label ?? messages.dismiss;
  return (
    <CloseButton
      size="sm"
      aria-label={name}
      title={name}
      className="env-alert-dismiss"
      onClick={onDismiss}
    />
  );
}
