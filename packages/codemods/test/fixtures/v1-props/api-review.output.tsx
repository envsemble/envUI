import { Composer, CopyButton } from '@envsemble/envui';

export function ApiReview({ link, onCopied, send }) {
  return (
    <>
      <Composer aria-label="Message" onSend={send} />
      <CopyButton value={link} aria-label="Copy link" onCopied={onCopied} />
    </>
  );
}
