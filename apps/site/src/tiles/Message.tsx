import { CopyButton, Message, MessageList, Row } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

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
 * In a phone's narrower tile it is narrower too, so it is drawn at about its own size there, and
 * its action is the icon alone, named in its tooltip, so Copied still shows beside the line.
 */
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
