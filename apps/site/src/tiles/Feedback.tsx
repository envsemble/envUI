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
import { useStageLayer } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

/**
 * The last invitation's notification dismissed, then another sent: the button works a moment, and
 * a notification says how it went, in the place the last one held, so nothing moves.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-toast-dismiss' },
  { wait: 300 },
  { click: true },
  { wait: 500 },
  { to: '.env-button', duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 80 },
  // Off the button it pressed, so its spinner shows clear while it works.
  { to: '.env-button', x: 1.35, y: 1.9, duration: 300 },
  { wait: 250 },
  { leave: true },
  { wait: 2600 },
];

const sent = { tone: 'success', message: 'Invitation sent.', duration: Infinity } as const;

function Invite() {
  const toast = useToast();
  const [sending, setSending] = useState(false);
  usePointer(script);
  // The still shows how the last invitation went, so the scene keeps the notification's room.
  useEffect(() => {
    const id = toast.show(sent);
    return () => toast.dismiss(id);
  }, [toast]);
  useEffect(() => {
    if (!sending) return;
    const timer = setTimeout(() => {
      setSending(false);
      toast.show(sent);
    }, 900);
    return () => clearTimeout(timer);
  }, [sending, toast]);
  // At the window's top, so the notification at its foot leaves the button in view.
  return (
    <Column gap={4} style={{ inlineSize: '17rem', minBlockSize: '11.5rem' }}>
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
  const layer = useStageLayer();
  if (!layer) return null;
  return (
    <PortalContainer container={layer}>
      <ToastProvider>
        <Invite />
      </ToastProvider>
    </PortalContainer>
  );
}
