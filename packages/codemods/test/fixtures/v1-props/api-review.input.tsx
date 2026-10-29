import { Alert, CalendarHeatmap, Composer, CopyButton, List, Slider, Toast } from '@envsemble/envui';

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
      <CalendarHeatmap aria-label="Deployments" data={[]} formatTooltip={(day) => day.date} />
      <Toast.Provider visibleLimit={2}>{null}</Toast.Provider>
    </>
  );
}
