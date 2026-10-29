import { Composer, CopyButton, Slider } from '@envsemble/envui';

export function ApiReview({ link, onCopied, send, opacity }) {
  return (
    <>
      <Composer aria-label="Message" footer="Files up to 10 MB." onSubmit={send} />
      <CopyButton value={link} aria-label="Copy link" onCopy={onCopied} />
      <Slider label="Opacity" inputRef={opacity} />
    </>
  );
}
