import { Composer, CopyButton } from '@envsemble/envui';

export function ApiReview({ link, onCopied, send }) {
  return (
    <>
      <Composer aria-label="Message" footer="Files up to 10 MB." onSubmit={send} />
      <CopyButton value={link} aria-label="Copy link" onCopy={onCopied} />
    </>
  );
}
