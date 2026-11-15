import { CopyButton, Message, MessageList, Row } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const answer = '.env-message[data-from="other"] .env-message-content';

const script: PointerStep[] = [
  { wait: 240 },
  { to: answer, x: 0.5, y: 0.5 },
  { wait: 90 },
  { to: '.env-copy-button', duration: 450 },
  { wait: 240 },
  { click: true },
  { wait: 540 },
  { to: answer, x: 0.5, y: 0.5, duration: 450 },
  { wait: 90 },
  { leave: true },
  { wait: 900 },
];

export default function MessageTile() {
  const narrow = useMedia(narrowGallery);
  usePointer(script);
  const text = 'Yes, it’s shared.';
  return (
    <MessageList aria-label="Conversation" style={{ inlineSize: narrow ? '8.75rem' : '12rem' }}>
      <Message
        from="other"
        author="Assistant"
        actions={
          <Row justify="end" style={{ flex: '1 1 auto' }}>
            {narrow ? (
              <CopyButton value={text} aria-label="Copy" />
            ) : (
              <CopyButton value={text}>Copy</CopyButton>
            )}
          </Row>
        }
      >
        {text}
      </Message>
    </MessageList>
  );
}
