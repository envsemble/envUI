import { useState } from 'react';
import { Button, Column, Message, MessageList, type MessageStatus } from '@envsemble/envui';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const firstActSoTheWaitAfterIsWhole: PointerStep = { cue: 'shown' };

const script: PointerStep[] = [
  firstActSoTheWaitAfterIsWhole,
  { wait: 840 },
  { cue: 'failed' },
  { wait: 420 },
  { to: '.env-message-actions .env-button', x: 0.5, y: 0.6, duration: 0 },
  { wait: 360 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { wait: 720 },
  { cue: 'sent' },
  { wait: 1200 },
  { cue: 'renew' },
  { wait: 270 },
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

export default function DeliveryStatusMotion() {
  return (
    <MotionStage label="the reply sending, failing and sent">
      <Delivering />
    </MotionStage>
  );
}
