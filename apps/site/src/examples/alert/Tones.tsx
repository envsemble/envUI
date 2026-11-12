import { Alert, Column } from '@envsemble/envui';

export default function Tones() {
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 32rem)' }}>
      <Alert title="Sync paused">Changes are saved on this device until you reconnect.</Alert>
      <Alert tone="success">The plan was shared with the team.</Alert>
      <Alert tone="warning" title="Storage almost full">
        Northwind has used 9.2 of 10 GB. Uploads stop once the space runs out.
      </Alert>
      <Alert tone="danger" title="Search is unavailable">
        The search service didn’t respond. Your open documents are still here.
      </Alert>
    </Column>
  );
}
