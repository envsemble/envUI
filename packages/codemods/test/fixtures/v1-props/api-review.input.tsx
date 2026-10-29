import { Alert, Composer, CopyButton, List, Slider } from '@envsemble/envui';

export function ApiReview({ link, onCopied, send, opacity }) {
  return (
    <>
      <Composer aria-label="Message" footer="Files up to 10 MB." onSubmit={send} />
      <CopyButton value={link} aria-label="Copy link" onCopy={onCopied} />
      <Slider label="Opacity" inputRef={opacity} />
      <Alert tone="warning" title="Read-only" action={<button>Request access</button>} />
      <List.Root>
        <List.Item label="Roadmap" action={<button>Open</button>} />
      </List.Root>
    </>
  );
}
