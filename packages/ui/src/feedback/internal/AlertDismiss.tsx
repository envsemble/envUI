'use client';

import { IconButton } from '../../actions/Button.js';
import { IconClose } from '../../icons/Close.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { alert } from '../../foundations/messages/alert.js';
import '../../styles/Base.css';
import '../../styles/Alert.css';

/**
 * An Alert's dismiss button: a small ghost IconButton with a cross in the alert's tone, named by the alert's label or
 * the provider's messages.alert.dismiss. A client leaf, so Alert itself stays a server component.
 */
export function AlertDismiss({ label, onDismiss }: { label?: string; onDismiss: () => void }) {
  const messages = useMessages('alert', alert);
  const name = label ?? messages.dismiss;
  return (
    <IconButton
      variant="ghost"
      size="sm"
      icon={<IconClose />}
      aria-label={name}
      title={name}
      className="env-alert-dismiss"
      onClick={onDismiss}
    />
  );
}
