import { Composer, CopyButton, Slider } from '@envsemble/envui';

export function ApiReview({ link, onCopied, send, opacity }) {
  return (
    <>
      <Composer aria-label="Message" description="Files up to 10 MB." onSend={send} />
      <CopyButton value={link} aria-label="Copy link" onCopied={onCopied} />
      <Slider label="Opacity" ref={opacity} />
    </>
  );
}
