import { Composer, CopyButton } from '@envsemble/envui';

export function ApiReview({ link, onCopied, send }) {
  return (
    <>
      <Composer aria-label="Message" onSubmit={send} />
      <CopyButton value={link} aria-label="Copy link" onCopy={onCopied} />
    </>
  );
}
