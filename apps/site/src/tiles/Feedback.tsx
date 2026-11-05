import { useEffect, useState } from 'react';
import {
  Button,
  Column,
  PortalContainer,
  TextField,
  ToastProvider,
  useToast,
} from '@envsemble/envui';
import { IconSend } from '@envsemble/envui/icons/Send';
import { usePointer, usePreviewLayer, type PointerStep } from '../motion/Motion';

/** The invitation sent: the button works a moment, and a notification says how it went. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-button' },
  { wait: 400 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 3600 },
];

function Invite() {
  const toast = useToast();
  const [sending, setSending] = useState(false);
  usePointer(script);
  useEffect(() => {
    if (!sending) return;
    const timer = setTimeout(() => {
      setSending(false);
      toast.show({ tone: 'success', message: 'Invitation sent.', duration: 2400 });
    }, 900);
    return () => clearTimeout(timer);
  }, [sending, toast]);
  // At the window's top, so the notification at its foot leaves the button in view.
  return (
    <Column gap={4} style={{ inlineSize: '14rem', minBlockSize: '11.5rem' }}>
      <TextField label="Email address" defaultValue="jordan.kim@example.com" />
      <Button startIcon={<IconSend />} pending={sending} onClick={() => setSending(true)}>
        Send invitation
      </Button>
    </Column>
  );
}

/**
 * A small form whose action says how it went: the button while it works, then a notification,
 * in the live region the tile's layer holds.
 */
export default function FeedbackTile() {
  const layer = usePreviewLayer();
  if (!layer) return null;
  return (
    <PortalContainer container={layer}>
      <ToastProvider>
        <Invite />
      </ToastProvider>
    </PortalContainer>
  );
}
