import { Alert, CalendarHeatmap, Composer, CopyButton, List, Slider, Toast } from '@envsemble/envui';

export function ApiReview({ link, onCopied, send, opacity }) {
  return (
    <>
      <Composer aria-label="Message" description="Files up to 10 MB." onSend={send} />
      <CopyButton value={link} aria-label="Copy link" onCopied={onCopied} />
      <Slider label="Opacity" ref={opacity} />
      <Alert tone="warning" title="Read-only" actions={<button>Request access</button>} />
      <List.Root>
        <List.Item label="Roadmap" end={<button>Open</button>} />
      </List.Root>
      <CalendarHeatmap aria-label="Deployments" data={[]} renderTooltip={(day) => day.date} />
      <Toast.Provider limit={2}>{null}</Toast.Provider>
    </>
  );
}
