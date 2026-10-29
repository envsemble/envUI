import { Composer, CopyButton } from '@envsemble/envui';

export function ApiReview({ link, onCopied, send }) {
  return (
    <>
      <Composer aria-label="Message" description="Files up to 10 MB." onSend={send} />
      <CopyButton value={link} aria-label="Copy link" onCopied={onCopied} />
    </>
  );
}
