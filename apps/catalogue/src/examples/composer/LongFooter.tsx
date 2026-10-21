import { Composer } from '@envsemble/envui';

const send = () => undefined;

export default function LongFooter() {
  return (
    <Composer
      aria-label="Comment"
      placeholder="Add a comment"
      footer="Press Enter to send and Shift+Enter for a new line. Comments are visible to everyone in the project and can be edited for 15 minutes. Files up to 10 MB."
      onSubmit={send}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    />
  );
}
