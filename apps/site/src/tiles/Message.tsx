import { CopyButton, Message, MessageList } from '@envsemble/envui';
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

/** A question of one's own, in a bubble, and the assistant's answer, with an action to copy it. */
export default function MessageTile() {
  usePointer(script);
  return (
    <MessageList aria-label="Conversation" style={{ inlineSize: '9.5rem' }}>
      <Message from="self">Is it ready?</Message>
      <Message
        from="other"
        author="Assistant"
        actions={<CopyButton value="Yes, it’s shared.">Copy</CopyButton>}
      >
        Yes, it’s shared.
      </Message>
    </MessageList>
  );
}
