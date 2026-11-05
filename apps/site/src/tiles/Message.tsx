import { CopyButton, Message, MessageList, Row } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const answer = '.env-message[data-from="other"] .env-message-content';

/** The answer copied with its action: its icon turns to a check and Copied shows, for a moment. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: answer, x: 0.5, y: 0.5 },
  { wait: 150 },
  { to: '.env-copy-button', duration: 450 },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { to: answer, x: 0.5, y: 0.5, duration: 450 },
  { wait: 150 },
  { leave: true },
  { wait: 1500 },
];

/**
 * The assistant's answer, with an action to copy it at its end, so Copied, above the action, shows
 * beside the answer's line rather than over it.
 */
export default function MessageTile() {
  usePointer(script);
  return (
    <MessageList aria-label="Conversation" style={{ inlineSize: '12rem' }}>
      <Message
        from="other"
        author="Assistant"
        actions={
          <Row justify="end" style={{ flex: '1 1 auto' }}>
            <CopyButton value="Yes, it’s shared.">Copy</CopyButton>
          </Row>
        }
      >
        Yes, it’s shared.
      </Message>
    </MessageList>
  );
}
