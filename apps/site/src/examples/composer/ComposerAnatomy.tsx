import { Composer, IconButton } from '@envsemble/envui';
import { IconAttachFile } from '@envsemble/envui/icons/AttachFile';

const send = () => undefined;

export default function ComposerAnatomy() {
  return (
    <Composer
      aria-label="Comment"
      placeholder="Add a comment"
      start={<IconButton variant="text" icon={<IconAttachFile />} aria-label="Attach files" />}
      description="Files up to 10 MB."
      onSend={send}
      style={{ inlineSize: 'min(100%, 28rem)' }}
    />
  );
}
