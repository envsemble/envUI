import { useState } from 'react';
import { Button, Column, Message, MessageList, type MessageStatus } from '@envsemble/envui';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

/*
 * The reply shows as Sending, and fails: Not sent, with Try again. The pointer presses Try again,
 * the reply shows as Sending again, and goes, leaving only its time. The conversation is drawn anew
 * as it began, with a short fade (Renew), since nothing in it unsends a message.
 */
const script: PointerStep[] = [
  // A first act, so the wait after it is whole: the reply shows as Sending a moment.
  { cue: 'shown' },
  { wait: 1400 },
  { cue: 'failed' },
  { wait: 700 },
  { to: '.env-message-actions .env-button', x: 0.5, y: 0.6, duration: 0 },
  { wait: 600 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 1200 },
  { cue: 'sent' },
  { wait: 2000 },
  { cue: 'renew' },
  { wait: 450 },
];

function Delivering() {
  const [status, setStatus] = useState<MessageStatus | undefined>('sending');
  const [round, setRound] = useState(0);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'failed') setStatus('failed');
      else if (cue === 'sent') setStatus(undefined);
      else if (cue === 'renew') {
        setRound((count) => count + 1);
        window.setTimeout(() => setStatus('sending'), 200);
      }
    },
  });
  return (
    // As tall as the reply with its status and Try again, from the start, the messages at its top,
    // so nothing moves as the status changes.
    <Column style={{ inlineSize: 'min(100%, 26rem)', minBlockSize: '15rem' }}>
      <Renew round={round}>
        <MessageList aria-label="Conversation with Sam Lee" style={{ inlineSize: '100%' }}>
          <Message from="other" author="Sam Lee" meta="09:40">
            Can you send me the venue address?
          </Message>
          <Message
            from="self"
            meta="09:41"
            status={status}
            actions={
              status === 'failed' && (
                <Button variant="text" onClick={() => setStatus('sending')}>
                  Try again
                </Button>
              )
            }
          >
            {'Northwind Hall\n12 Harbour Street'}
          </Message>
        </MessageList>
      </Renew>
    </Column>
  );
}

/** A reply that fails, is tried again by a pointer no one sees, and is sent. */
export default function DeliveryStatusMotion() {
  return (
    <MotionStage label="the reply sending, failing and sent">
      <Delivering />
    </MotionStage>
  );
}
